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

app.post('/mark', (req, res) => {
  const submissionID = req.query.sid;
  console.log(`Request to mark submission ${submissionID} received.`);
  res.sendStatus(200);

  // emulate waiting
  sleep.sleep(Math.floor(Math.random() * 5) + 1);

  const randomMark = Math.floor(Math.random() * 100);

  sendMark(randomMark, submissionID, (err, res, body) => {
    if (err) {
      console.log(`Error from request: ${err}`);
    }
  });

  const progressBarHTML = `<div class="progress"><div class="progress-bar" role="progressbar" style="width: ${randomMark}%;">${randomMark}%</div></div>`;

  sendFeedback(progressBarHTML, submissionID, (err, res, body) => {
    if (err) {
      console.log(`Error from request: ${err}`);
    }
  });
});

app.listen(port, () => {
  console.log(`Tool listening on port ${port}!`);
});
