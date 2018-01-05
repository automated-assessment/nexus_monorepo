import express from 'express';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { execSync, exec } from 'child_process';
import { sendMark, sendFeedback } from './utils';

const port = process.env.PORT || 5000;
const cmd = process.env.TOOL_CMD ? process.env.TOOL_CMD : `python3 ${path.resolve ('python', 'fm06assessor.py')}`;

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
  try {
    const submissionID = req.body.sid;
    const cloneURL = req.body.cloneurl;
    const branch = req.body.branch;
    const sha = req.body.sha;

    console.log(`Request to mark submission ${submissionID} received.`);

    // Poor man's worker queue: Simply enqueue marking of the submission for a later round on the node.js event loop
    // This won't be durable, so things may get lost when the marking tool is killed, but otherwise should work.
    process.nextTick(() => {markSubmission(submissionID, cloneURL, branch, sha);});
    console.log(`Request to mark submission ${submissionID} enqueued.`);

    res.sendStatus(200);
  } catch (e) {
    // Fix what request response we sent so that nexus knows something has gone wrong
    res.status(500).send(`Error in matlab-tool: ${e.toString()}`);
  } finally {
    return next();
  }
});

function markSubmission(submissionID, cloneURL, branch, sha) {
  let sourceDir = '';
  try {
    sourceDir = path.resolve(process.env.SUBMISSIONS_DIRECTORY, `cloned-submission-${submissionID}`);
    console.log(`Using directory ${sourceDir}.`);

    // Clean up repository directory in case it already exists for some reason
    _removeDirectoryIfExists(sourceDir);

    // clone repo
    const childGitClone = execSync(`git clone --branch ${branch} --single-branch ${cloneURL} ${sourceDir}`);
    const childGitCheckout = execSync(`git checkout ${sha}`, { cwd: sourceDir });

    console.log(`About to run marking tool for submission ${submissionID}.`);
    exec(`${cmd} --dir ${sourceDir}`, { cwd: sourceDir, env: {'NEXUS_ACCESS_TOKEN':''} }, (error, stdout, stderr) => {
      handleMarkingToolResults(error, stdout, stderr, submissionID, sourceDir);
    });
  } catch (e) {
    // Fix what request response we sent so that nexus knows something has gone wrong
    console.log(`Exception occurred marking submission ${submissionID}: ${e.toString()}.`);
    sendMark (0, submissionID);
    sendFeedback('<div class="generic-feedback">There was an error marking your submission. Please contact your lecturer.</div>',
          submissionID,
          (err, res, body) => {
            if (err) {
              console.log(`Error from Nexus feedback request: ${err}`);
            }
          });
    // Clean up repository directory after us
    _removeDirectoryIfExists(sourceDir);
  }
}

function handleMarkingToolResults(error, stdout, stderr, submissionID, sourceDir) {
  let exitCode = 0;
  let output = '';

  console.log(`STDERR was:\n${stderr}`);

  if (error) {
    if ((error.code >= 0) && (error.code <= 100)) {
      console.log(`Marking tool produced error code for submission ${submissionID}: ${error.code}.`);
      exitCode = error.code;
      output = stdout;
    } else {
      console.log(`Internal error running marking tool for submission ${submissionID}: ${error}: ${stdout}.`);
      output = 'Internal error: testing tool failed to run command.\n'+stdout;
      exitCode = -1;
    }
  } else {
    console.log(`Marking tool ran successfully for submission ${submissionID}.`);
    output = stdout;
  }

  if (exitCode>=0) {
    console.log(`Reporting mark to NEXUS for submission ${submissionID}.`);
    sendMark(exitCode, submissionID);

    console.log(`Reporting feedback to NEXUS for submission ${submissionID}.`);
    sendFeedback(`<div class="generic-feedback">${output}</div>`, submissionID, (err, res, body) => {
        if (err) {
          console.log(`Error from Nexus feedback request: ${err}`);
        }
    });
  } else {
    console.log(`Informing NEXUS of issues with marking submission ${submissionID}.`);
    sendMark (0, submissionID);
    sendFeedback('<div class="generic-feedback">There was an error marking your submission. Please contact your lecturer.</div>',
          submissionID,
          (err, res, body) => {
            if (err) {
              console.log(`Error from Nexus feedback request: ${err}`);
            }
          });
  }

  try {
    // Clean up repository directory after us
    _removeDirectoryIfExists(sourceDir);
  } catch (e) {
    console.log(`Error in generic testing tool: ${e.toString()}`);
  }
}

app.listen(port, () => {
  console.log(`Tool listening on port ${port}!`);
});
