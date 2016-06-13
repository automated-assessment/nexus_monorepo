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

app.use('/static', express.static(path.resolve(__dirname, 'configPage', 'dist')));

app.post('/config', (req, res, next) => {
  const aid = req.body.aid;
  if (isNaN(parseInt(req.body.aid, 10))) {
    res.status(400).send('aid is not a number!');
    return next();
  }
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
  // update config
  const config = jsonfile.readFileSync(configFile);
  console.log(`Read config: ${JSON.stringify(config)}`);
  config[aid] = {
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
  if (!req.query.aid || isNaN(req.query.aid)) {
    res.status(400).send('Invalid aid (assignment ID)');
    return next();
  }
  const submissionID = req.query.sid;
  const assignmentID = req.query.aid;
  console.log(`Request to mark submission ${submissionID} (assignment ${assignmentID} received.`);
  res.sendStatus(200);

  // load config
  const config = jsonfile.readFileSync(configFile);
  if (config[assignmentID].min === undefined) { console.log('No min value found in config! Will use default of 0'); }
  if (config[assignmentID].max === undefined) { console.log('No max value found in config! Will use default of 100'); }
  // default values
  let min = config[assignmentID].min || 0;
  let max = config[assignmentID].max || 100;
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
  const boundsHTML = `<p class="text-primary">Random number generated between bounds [${min}, ${max}]</p>`;
  const fullHTML = `<div>${progressBarHTML}${boundsHTML}</div>`;

  sendFeedback(fullHTML, submissionID, (err, res, body) => {
    if (err) {
      console.log(`Error from request: ${err}`);
    }
  });

  return next();
});

app.listen(port, () => {
  console.log(`Tool listening on port ${port}!`);
});
