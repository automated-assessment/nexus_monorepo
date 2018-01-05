import async from 'async';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { execSync, exec } from 'child_process';
import { sendMark, sendFeedback } from './utils';

const cmd = process.env.TOOL_CMD ? process.env.TOOL_CMD : `python3 ${path.resolve ('python', 'fm06assessor.py')}`;
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
    res.status(500).send(`Error in matlab-tool: ${e.toString()}`);
  } finally {
    return next();
  }
}

/**
 * Queue used to ensure only one instance of Matlab runs at any given time.
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
        doMarkSubmission(submissionID, sourceDir, cb);
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

function doMarkSubmission(submissionID, sourceDir, cb) {
  console.log(`About to run marking tool for submission ${submissionID}.`);
  exec(`${cmd} --dir ${sourceDir}`, { cwd: sourceDir, env: {'NEXUS_ACCESS_TOKEN':''} }, (error, stdout, stderr) => {
    handleMarkingToolResults(error, stdout, stderr, submissionID, sourceDir, cb);
  });
}

function handleMarkingToolResults(error, stdout, stderr, submissionID, sourceDir, cb) {
  let exitCode = 0;
  let output = '';

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

  // TODO Should really make the request sending into an async series, but this is probably OK for now
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

  cb();
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
