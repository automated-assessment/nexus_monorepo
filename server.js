import express from 'express';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { execSync } from 'child_process';
import { sendMark, sendFeedback } from './utils';

const port = process.env.PORT || 5000;

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

const WHITESPACE_REGEX = /^(.+[ \t]+.+)$/mg;

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

    // Find any .jar files, if any
    const jarFind = execSync('find . -name "*.jar" > options.txt', { cwd: sourceDir });
    const jarCat = execSync('cat options.txt', { cwd: sourceDir });
    const jarCatOutput = jarCat.toString();
    if (jarCatOutput.length > 0) {
      output += '<p class="text-info">Jar library files found:</p>';
      output += `<pre><code>${jarCatOutput}</code></pre>`;
      const WHITESPACE_LINES = jarCatOutput.match(WHITESPACE_REGEX);
      if (WHITESPACE_LINES !== null) {
        // send mark of 0 and feedback listing only those file names that have white space in them
        _sendMark(0, submissionID);
        output += '<p>You should not include whitespace in any Jar file names (or their paths) in your submission. Below are the files with problematic file names:</p>';
        output += `<pre><code>${WHITESPACE_LINES.join('\n')}</code></pre>`;
        output += '<p>No Java files were checked because there were problematic Jar libraries</p>';
        res.sendStatus(200);

        sendFeedback(`<div class="javac-feedback">${output}</div>`, submissionID, (err, res, body) => {
          if (err) {
            console.log(`Error from Nexus feedback request: ${err}`);
          }
        });
      }

      // Construct options file
      const jarFiles = `-cp ${jarCatOutput.split('\n').join(':')}`;
      const options = execSync(`echo "${jarFiles}" > options.txt`, { cwd: sourceDir });
    }

    // find .java files and cat to 'sources.txt'
    const childFind = execSync('find . -name "*.java" > sources.txt', { cwd: sourceDir });
    const childCat = execSync('cat sources.txt', { cwd: sourceDir });

    // append found files to html feedback
    output += '<p class="text-info">Java source files found:</p>';
    output += `<pre><code>${childCat.toString()}</code></pre>`;

    // here test for occurrence of whitespace in set of file names
    const WHITESPACE_LINES = childCat.toString().match(WHITESPACE_REGEX);
    if (WHITESPACE_LINES !== null) {
      // send mark of 0 and feedback listing only those file names that have white space in them
      _sendMark(0, submissionID);
      output += '<p>You should not include whitespace in any java file names (or their paths) in your submission. Below are the files with problematic file names:</p>';
      output += `<pre><code>${WHITESPACE_LINES.join('\n')}</code></pre>`;
      res.sendStatus(200);
    } else {
      // execute javac
      output += '<p class="text-info">Compiler Output:</p>';
      try {
        const childJavac = execSync('javac -Xlint:all @options.txt @sources.txt 2>&1', { cwd: sourceDir, timeout: 60000 });

        output += '<p class="text-info">Java sources compiled successfully.</p>';
        output += `<pre><code>${childJavac.toString()}</code></pre>`;

        // Success. Report 100 score
        _sendMark(100, submissionID);
        res.sendStatus(200);
      } catch (e) {
        output += `<pre><code>${e.toString()}\n${e.stdout.toString()}</code></pre>`;
        // Error. Report 0 score
        _sendMark(0, submissionID);
        res.sendStatus(200);
      }
    }
    // Send output as feedback
    sendFeedback(`<div class="javac-feedback">${output}</div>`, submissionID, (err, res, body) => {
      if (err) {
        console.log(`Error from Nexus feedback request: ${err}`);
      }
    });
  } catch (e) {
    // Fix what request response we sent so that nexus knows something has gone wrong
    res.status(500).send(`Error in javac-tool: ${e.toString()},\n${e.output.toString()}`);
  } finally {
    try {
    // Clean up repository directory after us
      _removeDirectoryIfExists(sourceDir);
    } catch (e) {
      console.log(`Error in javac-tool: ${e.toString()},\n${e.output.toString()}`);
    }
    return next();
  }
});

app.listen(port, () => {
  console.log(`Tool listening on port ${port}!`);
});
