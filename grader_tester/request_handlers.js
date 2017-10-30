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
  Object.keys(tests).forEach((test) => {
    console.log (`Running test ${test}.`);

    var sha;
    async.series([
        (cb) => { setup_submission_repo(sha, tests[test].submission, cb); },
        (cb) => { run_graders(tests[test].graders, sha, cb); }
      ],
      (err, results) => {
        remove_submission_repo();
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

function removeDirectoryIfExists (dir) {
  if (dir !== '') {
    if (fs.existsSync(dir)) {
      fs.removeSync(dir);
      console.log(`Cleaned up directory ${dir}.`);
    }
  }
}

const repo_folder = "/repositories/repos/test_submission";

function setup_submission_repo(sha, submission_folder, cb) {
  removeDirectoryIfExists(repo_folder);

  try {
    console.log ("Initialising repository.");
    const childGitInit = execSync(`git init --bare ${repo_folder}.git`);

    fs.copy(`/test-specs/submissions/${submission_folder}`, repo_folder, (err) => {
      if (err) {
        cb(err);
        return;
      }

      try {
        console.log("Adding files to repository.");
        const childGitAdd = execSync(`git add ${repo_folder}.git`);
        const childGitInit = execSync(`git commit -m 'Submission' ${repo_folder}.git`);

        cb();
      }
      catch (err) {
        cb(err);
      }
    });
  }
  catch (err) {
    cb(err);
  }
}

function run_graders(graders, sha, cb) {
  // TODO Run all graders on the submission
  cb();
}

function remove_submission_repo() {
  removeDirectoryIfExists(repo_folder);
}
