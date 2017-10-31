import async from 'async';
import forEachOf from 'async/eachOf';
import series from 'async/series';
import yaml from 'node-yaml';
import { execSync } from 'child_process';

const fs = require('fs-extra');

const accessToken = process.env.NEXUS_ACCESS_TOKEN;
if (!process.env.NEXUS_ACCESS_TOKEN) {
  console.log('Error: Specify NEXUS_ACCESS_TOKEN in environment');
  process.exit(1);
}

const GIT_HOST = process.env.GIT_HOST || 'git-server';
const GIT_PORT = process.env.GIT_PORT || 80;
const GIT_BASE_URL = `http://${GIT_HOST}:${GIT_PORT}/`;

export function handle_receive_mark (request, response) {

}

export function handle_receive_feedback (request, response) {

}

export function start_tests() {
  console.log ("Starting to run test.");

  yaml.read ("/test-specs/tests.yml", {schema: yaml.schema.defaultSafe}, (err, data) => {
    if (err) {
      console.log(`Error reading test specification: ${err}.`);
    } else {
      console.log("Read test specification, getting ready to run tests...");

      if (data.graders && data.tests) {
        run_tests(data.graders, data.tests);
      } else {
        console.log ("Incomplete specification: provide graders and tests.");
      }
    }

    console.log ("All tests have run.");
    process.exit(0);
  });
}

function run_tests(graders, tests) {
  // TODO Really should use async forEach or similar
  Object.keys(tests).forEach((test) => {
    console.log (`Running test ${test}.`);

    var sha;
    async.series([
        (cb) => { get_submission_sha(sha, tests[test].submission, cb); },
        (cb) => { run_graders(tests[test].graders, sha, cb); }
      ],
      (err, results) => {
        if (err) {
          console.log(`Error running tests: ${err}.`);
        } else {
          // TODO: Summarise results
        }
      }
    );

    console.log (`Finished running test ${test}.`);
  });
}

function get_submission_sha(sha, submission_folder, cb) {
  fs.readFile(`/repositories/${submission_folder}/packed-refs`, (err, data) => {
    if (err) {
      cb(err);
      return;
    }

    try {
      sha = /^([A-Za-z0-9]+)\s+refs\/heads\/master$/m.match(data)[1];
      cb();
    }
    catch (err) {
      cb(err);
    }
  });
}

function run_graders(graders, sha, cb) {
  // TODO Run all graders on the submission
  console.log("Ready to run graders.");
  cb();
}
