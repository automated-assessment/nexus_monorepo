import async from 'async';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { execSync, exec } from 'child_process';
import { sendMark, sendFeedback } from './utils';
import { doMarkSubmission } from './mark_submission';
var mysql = require('mysql');

const MAX_CONCURRENCY = process.env.MAX_CONCURRENCY ? parseInt(process.env.MAX_CONCURRENCY, 10) : 1;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
if (!AUTH_TOKEN) {
  console.log("Define AUTH_TOKEN environment variable.");
  process.exit(255);
}

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
  if ((!req.params.auth_token) ||
      (!req.params.auth_token == AUTH_TOKEN)) {
    console.log("Attempt to access configuration without proper authorization.");
    req.status(400).send('Missing authorization!');
    return next();
  }

  if (isNaN(parseInt(req.query.aid, 10))) {
    res.status(400).send('aid is not a number!');
    return next();
  }
  const aid = parseInt(req.query.aid);

  getConfigData(aid, (err, data) => {
    if (err) {
      console.log (`Error getting config data: ${err}.`);
      res.status(500).send('An internal erro occurred.');
    } else {
      console.log(`Loaded config data: ${JSON.stringify(data)}`);
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Update Config</title>
          </head>
          <body>
            <script>
              var CONFIG_PROPS = ${safeStringify(data.config)};
              var TOKEN = "${AUTH_TOKEN}";
              var AID = ${aid};
            </script>
            <div id="configNode"></div>
            <script src="/static/assets/bundle.js" type="text/javascript"></script>
          </body>
        </html>
        `);
    }
    return next();
  });
}

/**
 * Receive and store configuration information.
 */
export function storeConfigurationHandler(req, res, next) {
  if ((!req.params.auth_token) ||
      (!req.params.auth_token == AUTH_TOKEN)) {
    console.log("Attempt to access configuration without proper authorization.");
    req.status(400).send('Missing authorization!');
    return next();
  }

  const aid = req.body.aid;
  if (isNaN(parseInt(req.body.aid, 10))) {
    res.status(400).send('aid is not a number!');
    return next();
  }
  const config = JSON.stringify(req.body.config);

  console.log(`Received configuration information for assignment ${aid}: ${config}.`);

  res.sendStatus(200);

  storeConfigData(aid, config);
}
/**
 * Queue used to ensure only MAX_CONCURRENCY instances of the grader run at any given time.
 */
const marker_queue = async.queue((task, cb) => {
    markSubmission(task.aid, task.sid, task.cloneurl, task.branch, task.sha, cb);
  },
  MAX_CONCURRENCY
);

function markSubmission(aid, submissionID, cloneURL, branch, sha, cb) {
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
        getConfigData(aid, (err, data) => {
          if (err) {
            cb(err);
          } else {
            console.log(`Config data is ${JSON.stringify(data.config)}`);
            _doMarkSubmission(submissionID, sourceDir, data.config, cb);
          }
        });
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

function _doMarkSubmission(submissionID, sourceDir, config, cb) {
  // Call out to user-definable function
  doMarkSubmission(submissionID, sourceDir, config, (err, mark, feedback) => {
    if (err || (mark == -1)) {
      console.log(`Informing NEXUS of issues with marking submission ${submissionID}: ${err}.`);
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

var dbConnectionPool  = mysql.createPool({
  connectionLimit : 10,
  host: process.env.MYSQL_HOST || "mysql",
  port: 3306,
  user: process.env.MYSQL_USER || "abstr-grader",
  password: process.env.MYSQL_PASSWORD || "abstr-grader-pass",
  database: process.env.MYSQL_DATABASE || "abstr-grader"
});

dbConnectionPool.on('acquire', function (connection) {
  console.log('Connection %d acquired', connection.threadId);
});

dbConnectionPool.on('connection', function (connection) {
  connection.on('error', function(err) {
    console.log(`Connection-level error occurred: ${err.code}.`);
    if (err.fatal) {
      // Cleanup is already handled by DB pool
      console.log("This was a fatal error.");
    }
  });
});

dbConnectionPool.on('enqueue', function () {
  console.log('Waiting for available connection slot');
});

dbConnectionPool.on('release', function (connection) {
  console.log('Connection %d released', connection.threadId);
});

function initialiseDB() {
  dbConnectionPool.query("CREATE TABLE grader_config (aid INT, config TEXT, PRIMARY KEY (aid)) ENGINE=INNODB;", (err, result) => {
    if (err && err.code !== "ER_TABLE_EXISTS_ERROR") {
      console.log(`Error creating table: ${err}`);
      if (err.code == "ECONNREFUSED") {
        console.log("Retrying to initialise DB.");
        setTimeout(initialiseDB, 500);
        return;
      } else {
        process.exit(255);
      }
    }

    console.log("Initialised database.");
  });
}
initialiseDB();

function getConfigData(aid, cb) {
  dbConnectionPool.query("SELECT * FROM grader_config WHERE aid=?", [aid], (err, result) => {
    if (err) {
      cb(err);
    } else {
      var data = {
        aid: aid
      };

      if (result.length > 0) {
        if (result[0].config) {
          data.config = JSON.parse(result[0].config);
        }
      }

      cb(null, data);
    }
  });
}

function storeConfigData (aid, config) {
  dbConnectionPool.query("SELECT * FROM grader_config WHERE aid=?", [aid], (err, result) => {
    if (err) {
      console.log(`Error querying database: ${err}.`);
    } else {
      var sql = "";
      var args = [];
      if (result.length > 0) {
        sql = "UPDATE grader_config SET config=? WHERE aid=?";
        args = [config, aid];
      } else {
        sql = "INSERT INTO grader_config VALUES(?)";
        args = [[aid, config]];
      }

      dbConnectionPool.query(sql, args, (err, result) => {
        if (err) {
          console.log(`Error updating configuration for ${aid}: ${err}.`);
        } else {
          console.log(`Successfully updated configuration for ${aid}.`);
        }
      });
    }
  });
}

// A utility function to safely escape JSON for embedding in a <script> tag
function safeStringify(obj) {
  if (obj) {
    return JSON.stringify(obj)
    .replace(/<\/(script)/ig, '<\\/$1')
    .replace(/<!--/g, '<\\!--')
    .replace(/\u2028/g, '\\u2028') // Only necessary if interpreting as JS, which we do
    .replace(/\u2029/g, '\\u2029') // Ditto
  } else {
    return "null";
  }
}
