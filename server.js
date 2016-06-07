import express from 'express';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import path from 'path';
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

const app = express();

app.use(bodyParser.json());
app.use(errorhandler({
  dumpExceptions: true,
  showStack: true
}));

app.get('/say_hello', (req, res) => {
  console.log('Hello!');
  res.sendStatus(200);
});

app.post('/mark_javac', (req, res) => {
  let output = '';
  const submissionID = req.query.sid;
  console.log(`Request to mark submission ${submissionID} received.`);
  res.sendStatus(200);

  const sourceDir = path.resolve(process.env.SUBMISSIONS_DIRECTORY, submissionID);
  console.log(`Using directory: ${sourceDir}`);

  try {
    const childFind = execSync('find . -name "*.java" > sources.txt', { cwd: sourceDir });
    const childCat = execSync('cat sources.txt', { cwd: sourceDir });
    output += '<p class="text-info">Java source files found:</p>';
    output += `<pre><code>${childCat.toString()}</code></pre>`;
    output += '<p class="text-info">Compiler Output:</p>';
    const childJavac = execSync('javac -Xlint:all @sources.txt 2>&1', { cwd: sourceDir, timeout: 60000 });
    output += `<pre><code>${childJavac.toString()}</code></pre>`;
    // Success. Report 100 score
    sendMark(100, submissionID, (err, res, body) => {
      if (err) {
        console.log(`Error from request: ${err}`);
      }
    });
  } catch (e) {
    output += `<pre><code>${e.toString()}\n${e.stdout.toString()}</code></pre>`;
    // Error. Report 0 score
    sendMark(0, submissionID, (err, res, body) => {
      if (err) {
        console.log(`Error from request: ${err}`);
      }
    });
  } finally {
    // Send output as feedback
    sendFeedback(`<div class="javac-feedback">${output}</div>`, submissionID, (err, res, body) => {
      if (err) {
        console.log(`Error from request: ${err}`);
      }
    });
  }
});

app.listen(port, () => {
  console.log(`Tool listening on port ${port}!`);
});
