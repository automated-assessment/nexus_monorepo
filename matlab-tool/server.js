import express from 'express';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import { markRequestHandler } from './request_handlers';

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

// Health check
app.head('/mark', (req, res, next) => {
    res.sendStatus(200);
});

app.post('/mark', markRequestHandler);

app.listen(port, () => {
  console.log(`Tool listening on port ${port}!`);
});
