import express from 'express';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { execSync } from 'child_process';
import { sendMark, sendFeedback } from './utils';

const port = process.env.PORT || 5000;
const cmd = process.env.TOOL_CMD ? process.env.TOOL_CMD : 'python python/fm06assessor.py';

if (!process.env.NEXUS_ACCESS_TOKEN) {
  console.log('Error: Specify NEXUS_ACCESS_TOKEN in environment');
  process.exit(1);
}

if (!process.env.SUBMISSIONS_DIRECTORY) {
  console.log('Error: Specify SUBMISSIONS_DIRECTORY in environment');
  process.exit(1);
}

process.on('SIGINT', () => {
  process.exit();
});

const app = express();

app.use(bodyParser.json());
app.use(errorhandler({
  dumpExceptions: true,
  showStack: true
}));


const _sendMark = (mark, submissionID) => {
  sendMark(mark, submissionID, (err, res, body) => {
    if (err) {
      console.log(`Error from request: ${err}`);
      res.status(500).send(`Error from Nexus mark request: ${err}`);
    }
  });
};

const _removeDirectoryIfExists = (dir) => {
  if (dir !== '') {    
    if (fs.existsSync(dir)) {
      fsExtra.removeSync(dir);
      console.log(`Cleaned up directory ${dir}.`);
    }
  }
};

app.post('/mark', (req, res, next) => {
  let sourceDir = '';
  try {
    const submissionID = req.body.sid;
    const cloneURL = req.body.cloneurl;
    const branch = req.body.branch;
    const sha = req.body.sha;

    sourceDir = path.resolve(process.env.SUBMISSIONS_DIRECTORY, `cloned-submission-${submissionID}`);
    console.log(`Using directory ${sourceDir}.`);

    // Clean up repository directory in case it already exists for some reason
    _removeDirectoryIfExists(sourceDir);

    let output = '';
    console.log(`Request to mark submission ${submissionID} received.`);

    // clone repo
    const childGitClone = execSync(`git clone --branch ${branch} --single-branch ${cloneURL} ${sourceDir}`);
    const childGitCheckout = execSync(`git checkout ${sha}`, { cwd: sourceDir });

    exitCode = 0;
    try {
        // TODO check does this meet the security requirement?
       output = execSync(`${cmd} --dir ${sourceDir}`, { cwd: sourceDir, env: {'NEXUS_ACCESS_TOKEN':''} });
       exitCode = 0;
    } catch (r) {
      if (r.error.code) {
         exitCode = r.errorCode;         
         output = r.stdout;
      } else {
         output = 'Internal error: testing tool failed to run command.';
         exitCode = -1;
      }
    }
      
    if (exitCode>=0) {
      // Success. Report 100 score
      sendMark(exitCode, submissionID);
      res.sendStatus(200);
      // Send output as feedback
      sendFeedback(`<div class="generic-feedback">${output}</div>`, submissionID, (err, res, body) => {
          if (err) {
            console.log(`Error from Nexus feedback request: ${err}`);
          }
      });          
    } else {
      res.status(500).send( output );
    }

  } catch (e) {
    // Fix what request response we sent so that nexus knows something has gone wrong
    res.status(500).send(`Error in generic testing tool: ${e.toString()},\n${e.output.toString()}`);
  } finally {
    try {
    // Clean up repository directory after us
      _removeDirectoryIfExists(sourceDir);
    } catch (e) {
      console.log(`Error in generic testing tool: ${e.toString()},\n${e.output.toString()}`);
    }
    return next();
  }
});

app.listen(port, () => {
  console.log(`Tool listening on port ${port}!`);
});
