import async from 'async';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { execSync, exec } from 'child_process';
import { sendMark, sendFeedback } from './utils';
import { doMarkSubmission } from './mark_submission';

const MAX_CONCURRENCY = process.env.MAX_CONCURRENCY ? parseInt(process.env.MAX_CONCURRENCY, 10) : 1;

/**
 * Respond to a mark request. This will initially only enqueue the mark request
 * so that it can be handled at a later stage.
 */
export function markRequestHandler(req, res, next) {
  try {
    const submissionID = req.body.sid;
    console.log(`Request to mark submission ${submissionID} received.`);

    marker_queue.push(req.body);

    console.log(`Request to mark submission ${submissionID} enqueued.`);
    res.sendStatus(200);
  } catch (e) {
    // Fix what request response we sent so that nexus knows something has gone wrong
    res.status(500).send(`Error in grader: ${e.toString()}`);
  } finally {
    return next();
  }
}

/**
 * Render the configuration page, if any.
 */
export function configurationPageHandler(req, res, next) {
  if (isNaN(parseInt(req.query.aid, 10))) {
    res.status(400).send('aid is not a number!');
    return next();
  }
  const aid = parseInt(req.query.aid);

  // TODO: Check authorization token

  res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Update Config</title>
        </head>
        <body>
          <script>
            var CONFIG_PROPS = ${safeStringify(getConfigData(aid))}
          </script>
          <div id="configNode"></div>
          <script src="/static/assets/bundle.js" type="text/javascript"></script>
        </body>
      </html>
    `);
}

/**
 * Receive and store configuration information.
 */
export function storeConfigurationHandler(req, res, next) {
  res.status(500).send('Not implemented yet.');
}
/**
 * Queue used to ensure only MAX_CONCURRENCY instances of the grader run at any given time.
 */
const marker_queue = async.queue((task, cb) => {
    markSubmission(task.sid, task.cloneurl, task.branch, task.sha, cb);
  },
  MAX_CONCURRENCY
);

function markSubmission(submissionID, cloneURL, branch, sha, cb) {
  console.log(`Starting marking process for submission ${submissionID}.`);
  const sourceDir = path.resolve(process.env.SUBMISSIONS_DIRECTORY, `cloned-submission-${submissionID}`);

  async.series([
      (cb) => {
        cloneSubmissionCode(cloneURL, branch, sourceDir, cb);
      },
      (cb) => {
        checkoutSubmissionCode(sha, sourceDir, cb);
      },
      (cb) => {
        _doMarkSubmission(submissionID, sourceDir, cb);
      }
    ],
    (err, res) => {
      if (err) {
        // Fix what request response we sent so that nexus knows something has gone wrong
        console.log(`Error occurred marking submission ${submissionID}: ${err.toString()}.`);
        sendMark (0, submissionID);
        sendFeedback('<div class="generic-feedback">There was an error marking your submission. Please contact your lecturer.</div>',
              submissionID,
              (err, res, body) => {
                if (err) {
                  console.log(`Error from Nexus feedback request: ${err}`);
                }
              });
      }

      // Clean up repository directory after us
      removeDirectoryIfExists(sourceDir);

      cb();
    }
  );
}

function cloneSubmissionCode(cloneURL, branch, sourceDir, cb) {
  console.log(`Using directory ${sourceDir}.`);

  // Clean up repository directory in case it already exists for some reason
  removeDirectoryIfExists(sourceDir);

  // clone repo
  exec(`git clone --branch ${branch} --single-branch ${cloneURL} ${sourceDir}`,
    (error, stdout, stderr) => {
      cb(error);
    }
  );
}

function checkoutSubmissionCode(sha, sourceDir, cb) {
  exec(`git checkout ${sha}`, { cwd: sourceDir },
    (error, stdout, stderr) => {
      cb(error);
    }
  );
}

function _doMarkSubmission(submissionID, sourceDir, cb) {
  // Call out to user-definable function
  doMarkSubmission(submissionID, sourceDir, (err, mark, feedback) => {
    if (err || (mark == -1)) {
      console.log(`Informing NEXUS of issues with marking submission ${submissionID}.`);
      sendMark (0, submissionID);
      sendFeedback('<div class="generic-feedback">There was an error marking your submission. Please contact your lecturer.</div>',
            submissionID,
            (err, res, body) => {
              if (err) {
                console.log(`Error from Nexus feedback request: ${err}`);
              }
            });

      cb();
    } else {
      console.log(`Reporting mark to NEXUS for submission ${submissionID}.`);
      sendMark(mark, submissionID);

      console.log(`Reporting feedback to NEXUS for submission ${submissionID}.`);
      sendFeedback(`<div class="generic-feedback">${feedback}</div>`, submissionID, (err, res, body) => {
          if (err) {
            console.log(`Error from Nexus feedback request: ${err}`);
          }
      });

      cb();
    }
  });
}

// TODO: Make this async
function removeDirectoryIfExists(dir) {
  if (dir !== '') {
    if (fs.existsSync(dir)) {
      fsExtra.removeSync(dir);
      console.log(`Cleaned up directory ${dir}.`);
    }
  }
}

function getConfigData(aid) {
  return {
    aid: aid,
    initMin: 10,
    initMax: 20
  };
}

// A utility function to safely escape JSON for embedding in a <script> tag
function safeStringify(obj) {
  return JSON.stringify(obj)
    .replace(/<\/(script)/ig, '<\\/$1')
    .replace(/<!--/g, '<\\!--')
    .replace(/\u2028/g, '\\u2028') // Only necessary if interpreting as JS, which we do
    .replace(/\u2029/g, '\\u2029') // Ditto
}
