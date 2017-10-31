import express from 'express';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import path from 'path';
import sleep from 'sleep';
import { execSync } from 'child_process';
import { sendMark, sendFeedback } from './utils';

const port = process.env.PORT || 5001;

const app = express();

app.use(bodyParser.json());
app.use(errorhandler({
  dumpExceptions: true,
  showStack: true
}));

process.on('SIGINT', function() {
    process.exit();
});

app.head('/mark', (req, res, next) => {
  res.sendStatus(200);
});
app.post('/mark', (req, res, next) => {
  if (!req.body.sid || isNaN(req.body.sid)) {
    res.status(400).send('Invalid sid (submission ID)');
    return next();
  }
  const submissionID = req.body.sid;
  console.log(`Request to mark submission ${submissionID} received.`);

  // Poor man's worker queue: Simply enqueue marking of the submission for a later round on the node.js event loop
  // This won't be durable, so things may get lost when the marking tool is killed, but otherwise should work.
  process.nextTick(() => {markSubmission(submissionID);});
  console.log(`Request to mark submission ${submissionID} enqueued.`);

  // Tell Nexus we will handle this...
  res.sendStatus(200);

  return next();
});

function markSubmission(submissionID) {
  console.log(`About to mark submission ${submissionID}.`);

  // emulate waiting
  sleep.sleep(Math.floor(Math.random() * 5) + 1);

  // Generate mark
  const randomMark = Math.floor(Math.random() * 100);

  sendMark(randomMark, submissionID, (err, res, body) => {
    if (err) {
      console.log(`Error from request (mark for submission ${submissionID}): ${err}`);
    }
  });

  const progressBarHTML = `<div class="progress"><div class="progress-bar" role="progressbar" style="width: ${randomMark}%;">${randomMark}%</div></div>`;

  sendFeedback(progressBarHTML, submissionID, (err, res, body) => {
    if (err) {
      console.log(`Error from request (feedback for submission ${submissionID}): ${err}`);
    }
  });

  console.log(`Finished marking submission ${submissionID}. Mark was ${randomMark}.`);
}

app.listen(port, () => {
  console.log(`Tool listening on port ${port}!`);
});
