import async from 'async';
import forEachSeries from 'async/eachSeries';
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
        process.exit(0);
      }
    }
  });
}

function run_tests(graders, tests) {
  async.forEachSeries(Object.keys(tests),
    (test, cb) => {
      console.log (`Running test ${test}.`);

      var sha = [];
      async.series([
          (cb) => { get_submission_sha(sha, tests[test].submission, cb); },
          (cb) => { run_graders(tests[test].graders, tests[test].submission, sha, graders, cb); }
        ],
        (err, results) => {
          if (err) {
            cb(err);
          } else {
            console.log (`Finished running test ${test}.`);
            cb();
          }
        }
      );
    },
    (err) => {
      if (err) {
        console.log(`Error running tests: ${err}.`);
      }

      // TODO: Summarise results

      console.log ("All tests have run.");
      process.exit(0);
    }
  );
}

function get_submission_sha(sha, submission_folder, cb) {
  fs.readFile(`/repositories/${submission_folder}.git/packed-refs`, (err, data) => {
    if (err) {
      cb(err);
      return;
    }

    try {
      sha[0] = /^([A-Za-z0-9]+)\s+refs\/heads\/master$/m.exec(data)[1];
      cb();
    }
    catch (err) {
      cb(err);
    }
  });
}

function run_graders(grader_test_specs, submission_folder, sha, graders, cb) {
  console.log(`Ready to run graders on SHA ${sha[0]}.`);

  // Fake submission data
  var submission_request_body = {
    student: "Ms Tamara Test-Student",
    studentuid: 77,
    studentemail: "tamara.test_student@kcl.ac.uk",
    sid: 15,
    aid: 1,
    is_unique: false,
    description_string: "",
    cloneurl: `${GIT_BASE_URL}${submission_folder}.git`,
    branch: "master",
    sha: sha,
    nextservices: []
  };

  async.forEachSeries(Object.keys(grader_test_specs),
    (grader_test_spec, cb) => {
      console.log(`About to run test for ${grader_test_spec}.`);
      run_grader(grader_test_specs[grader_test_spec], submission_request_body, graders[grader_test_spec], cb);
    },
    (err) => {
      cb (err, []);
    }
  );
}

function run_grader(grader_test_spec, submission_request_body, grader_spec, cb) {
  // TODO Run grader on the submission
  cb();
}
