import async from 'async';
import forEachSeries from 'async/eachSeries';
import forEach from 'async/each';
import series from 'async/series';
import yaml from 'node-yaml';
import { execSync } from 'child_process';
import request from 'request';
import waitOn from 'wait-on';

var colors = require('colors');

const fs = require('fs-extra');

const accessToken = process.env.NEXUS_ACCESS_TOKEN;
if (!process.env.NEXUS_ACCESS_TOKEN) {
  console.log('Error: Specify NEXUS_ACCESS_TOKEN in environment'.red);
  process.exit(1);
}

const GIT_HOST = process.env.GIT_HOST || 'git-server';
const GIT_PORT = process.env.GIT_PORT || 80;
const GIT_BASE_URL = `http://${GIT_HOST}:${GIT_PORT}/`;

start_tests();

function start_tests() {
  console.log ("Starting to run test.");

  yaml.read ("/test-specs/tests.yml", {schema: yaml.schema.defaultSafe}, (err, data) => {
    if (err) {
      console.log(`Error reading test specification: ${err}.`.red);
    } else {
      console.log("Read test specification, getting ready to run tests...");

      if (data.graders && data.tests) {
        async.series([
            (cb) => { wait_for_graders(data.graders, cb); },
            (cb) => { run_tests(data.graders, data.tests, cb); }
          ],
          (err, result) => {
            if (err) {
              console.log(`Error running tests: ${err}.`.red);
            }
            else {
              console.log ("All tests have run.");
            }
            process.exit(0);
          }
        );
      } else {
        console.log ("Incomplete specification: provide graders and tests.".red);
        process.exit(0);
      }
    }
  });
}

function wait_for_graders(graders, cb) {
  var opts = {
    /*
     * TODO: Was experimenting with waiting for git-server, too, but that
     * didn't work for two reasons:
     *
     * 1. git-server actually returns 404 when asked for an arbitrary url
     * 2. the original problem was that tests would sometimes not run through
     *    because they couldn't access the relevant commit SHAs on the file
     *    system. Interestingly, in these cases, git-server seemed to believe
     *    it had done everything needed, but the files just hadn't showed up on
     *    the shared volume yet.
     *
     */
    resources: Object.keys(graders).map((grader_name) => {
        return `http://${grader_name}:${graders[grader_name].port}${graders[grader_name].mark}`;
      }).concat(['http://grader-tester:3000/healthy']),
    delay: 1000, // initial delay in ms, default 0
    interval: 100, // poll interval in ms, default 250ms
    timeout: 30000, // timeout in ms, default Infinity
    window: 1000, // stabilization time in ms, default 750ms
    strictSSL: false,
    followAllRedirects: true,
    followRedirect: true
  };

  console.log("Waiting for graders and grader-tester server to spin up...");
  waitOn(opts, (err) => {
    if (err) {
      console.log("Issue waiting for graders. Are they all responding to HEAD requests on their mark endpoints?".red);
      cb(err, []);
      return;
    }

    // once here, all resources are available
    console.log("All graders are up.");
    cb(null, []);
  });
}

function run_tests(graders, tests, cb) {
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
      // TODO: Summarise results

      cb(err, []);
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
      run_grader(grader_test_spec, grader_test_specs[grader_test_spec], submission_request_body, graders[grader_test_spec], cb);
    },
    (err) => {
      cb (err, []);
    }
  );
}

function run_grader(grader_name, grader_test_spec, submission_request_body, grader_spec, cb) {
  async.series({
      configure: (cb) => { configure_test_for (grader_spec.canonical_name, grader_test_spec, submission_request_body.sid, cb); },
      invoke: (cb) => { do_invoke_grader (grader_name, grader_test_spec, submission_request_body, grader_spec, cb); },
      results: (cb) => { wait_for_test_results (grader_spec.canonical_name, grader_test_spec, submission_request_body.sid, cb); }
    },
    (err, data) => {
      if (err) {
        cb(err);
      } else {
        var test_result = data.results;
        if (test_result.is_complete) {
          if (test_result.mark.is_correct) {
            console.log(test_result.mark.message.green);
          } else {
            console.log(test_result.mark.message.red);
          }

          if (test_result.feedback.is_correct) {
            console.log(test_result.feedback.message.green);
          } else {
            console.log(test_result.feedback.message.red);
          }

          cb();
        } else {
          // Really strange: Why did we receive this in the first place, then?
          cb("Received incomplete test result.");
        }
      }
    }
  );
}

function configure_test_for (grader_canonical_name, grader_test_spec, submission_id, cb) {
  const requestOptions = {
    url: `http://grader-tester:3000/tests/configure/${submission_id}/${grader_canonical_name}`,
    method: 'POST',
    json: true,
    body: grader_test_spec
  };

  request(requestOptions, (err, res, body) => {
    if (err) {
      console.log(`Could not configure test server: ${err}.`.red);
      cb(err);
    } else {
      if (res.statusCode == 200) {
        console.log('Test server configured.');
        cb();
      } else {
        console.log(`Received non-200 return from test server: ${body}.`.red);
        cb(`Received non-200 return from test server: ${body}.`);
      }
    }
  });
}

function do_invoke_grader (grader_name, grader_test_spec, submission_request_body, grader_spec, cb) {
  const requestOptions = {
    url: `http://${grader_name}:${grader_spec.port}${grader_spec.mark}`,
    method: 'POST',
    headers: {
      'Nexus-Access-Token': accessToken
    },
    json: true,
    body: submission_request_body
  };

  request(requestOptions, (err, res, body) => {
    if (err) {
      console.log(`Retrieved error from call to ${grader_name}: ${err}.`.red);
      cb(err);
    } else {
      if (res.statusCode == 200) {
        console.log(`${grader_name} reports successfully receiving the submission.`.green);
        cb();
      } else {
        console.log(`Received non-200 return from ${grader_name}: ${body}.`.red);
        cb(`Received non-200 return from ${grader_name}: ${body}.`);
      }
    }
  });
}

function wait_for_test_results (grader_canonical_name, grader_test_spec, submission_id, cb) {
  const requestOptions = {
    url: `http://grader-tester:3000/tests/results/${submission_id}/${grader_canonical_name}`,
    method: 'GET',
  };

  request(requestOptions, (err, res, body) => {
    if (err) {
      console.log(`Error retrieving test results: ${err}.`.red);
      cb(err);
    } else {
      if (res.statusCode == 200) {
        cb(null, JSON.parse(body));
      } else {
        console.log(`Received non-200 return from test server: ${body}.`.red);
        cb(`Received non-200 return from test server: ${body}.`);
      }
    }
  });
}
