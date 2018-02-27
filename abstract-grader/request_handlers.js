import async from 'async';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { execSync, exec } from 'child_process';
import { sendMark, sendFeedback } from './utils';
import { doMarkSubmission } from './mark_submission';

const MAX_CONCURRENCY = 1;

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

      cb(err);
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
