import express from 'express';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import jsonfile from 'jsonfile';
import path from 'path';
import sleep from 'sleep';
import { execSync } from 'child_process';
import { sendMark, sendFeedback } from './utils';

const port = process.env.PORT || 5001;
const configFile = 'config.json';

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(errorhandler({
  dumpExceptions: true,
  showStack: true
}));

app.get('/config', (req, res, next) => {
  res.sendFile(path.resolve(__dirname, 'config.html'));
});

app.post('/config', (req, res, next) => {
  let min = parseInt(req.body.min, 10);
  let max = parseInt(req.body.max, 10);
  if (isNaN(min) || isNaN(max)) {
    res.status(400).send('Invalid min/max values!');
    return next();
  }
  res.sendStatus(200);
  // sanity checks
  if (min < 0) {
    min = 0;
  }
  if (max > 100) {
    max = 100;
  }
  // save config
  const config = {
    min,
    max
  };
  console.log(`Updating config: ${JSON.stringify(config)}`);
  jsonfile.writeFileSync(configFile, config);

  return next();
});

app.post('/mark', (req, res, next) => {
  if (!req.query.sid || isNaN(req.query.sid)) {
    res.status(400).send('Invalid sid (submission ID)');
    return next();
  }
  const submissionID = req.query.sid;
  console.log(`Request to mark submission ${submissionID} received.`);
  res.sendStatus(200);

  // load config
  const config = jsonfile.readFileSync(configFile);
  if (config.min === undefined) { console.log('No min value found in config! Will use default of 0'); }
  if (config.max === undefined) { console.log('No max value found in config! Will use default of 100'); }
  // default values
  let min = config.min || 0;
  let max = config.max || 100;
  // sanity checks
  if (min < 0) {
    min = 0;
  }
  if (max > 100) {
    max = 100;
  }
  // generate number
  console.log(`Generating random number in range [${min}, ${max}]`);
  const randomMark = Math.floor(Math.random() * (max - min + 1)) + min;

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

  return next();
});

app.listen(port, () => {
  console.log(`Tool listening on port ${port}!`);
});
