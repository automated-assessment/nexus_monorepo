import async from 'async';
import forEachSeries from 'async/eachSeries';
import forEach from 'async/each';
import series from 'async/series';
import mapSeries from 'async/mapSeries';
import yaml from 'node-yaml';
import { execSync } from 'child_process';
import request, { del } from 'request';
import waitOn from 'wait-on';
import { json } from 'body-parser';

var colors = require('colors');

const fs = require('fs-extra');
const glob = require('glob');
const merge = require('lodash.merge');

colors.setTheme({
  log: 'grey',
  error: 'red',
  good: 'green'
});

const accessToken = process.env.NEXUS_ACCESS_TOKEN;
if (!process.env.NEXUS_ACCESS_TOKEN) {
  console.log('Error: Specify NEXUS_ACCESS_TOKEN in environment'.error);
  process.exit(1);
}

const GIT_HOST = process.env.GIT_HOST || 'git-server';
const GIT_PORT = process.env.GIT_PORT || 80;
const GIT_BASE_URL = `http://${GIT_HOST}:${GIT_PORT}/`;

start_tests();

function load_yaml(cb) {
  // Grab names of files / GLOBS to use from command line
  var sources = process.argv.slice(2);
  // Always include default tests.yml
  sources.unshift("/test-specs/tests.yml");
  const files = [].concat.apply([], sources.map(g => glob.sync(g, {nodir: true})));

  // Load and merge yml files
  var mergedConfig;
  async.each(files,
    (f, cb2) => {
      yaml.read (f, {schema: yaml.schema.defaultSafe}, (err, data) => {
        if (err) {
          console.log(`Error reading test specification ${f}: ${err}.`.error);
          process.exit(-1);
        } else {
          if (!mergedConfig) {
            mergedConfig = data;
          } else {
            merge(mergedConfig, data);
          }
        }
        cb2(err);
      });
    },
    (err) => { cb (err, mergedConfig); }
  );
}

function start_tests() {
  load_yaml ((err, data) => {
    if (err) {
      console.log(`Error reading test specification: ${err}.`.error);
    } else {
      console.log("Read test specification, getting ready to run tests...".log);

      if (data.graders && data.tests) {
        async.series({
            wait: (cb) => { wait_for_graders(data.graders, cb); },
            tests: (cb) => { run_tests(data.graders, data.tests, cb); }
          },
          (err, result) => {
            if (err) {
              console.log(`Error running tests: ${err}.`.error);
              process.exit(-1);
            }
            else {
              console.log ("All tests have run.".log);
              var total_results = result.tests.reduce (
                (acc, test_result) => {
                  return test_result.reduce (
                    (acc, grader_result) => {
                      acc.total_tests++;
                      if (grader_result.mark_correct) {
                        acc.total_good_marks++;
                      } else {
                        acc.total_bad_marks++;
                      }

                      if (grader_result.feedback_correct) {
                        acc.total_good_feedback++;
                      } else {
                        acc.total_bad_feedback++;
                      }

                      return acc;
                    },
                    acc);
                },
                {
                  total_tests: 0,
                  total_good_marks: 0,
                  total_good_feedback: 0,
                  total_bad_marks: 0,
                  total_bad_feedback: 0
                }
              );

              console.log (`Ran ${total_results.total_tests} tests.`);
              if ((total_results.total_bad_marks == 0) && (total_results.total_bad_feedback == 0)) {
                console.log ('All tests passed.'.good);
              } else {
                if (total_results.total_bad_marks == 0) {
                  console.log ('All marks computed correctly.'.good);
                } else {
                  console.log (`${total_results.total_bad_marks} marks computed incorrectly (see above for details).`.error)
                }

                if (total_results.total_bad_feedback == 0) {
                  console.log ('All feedback computed correctly or ignored.'.good);
                } else {
                  console.log (`${total_results.total_bad_feedback} feedback items computed incorrectly (see above for details).`.error)
                }
              }

              process.exit (total_results.total_bad_marks + total_results.total_bad_feedback);
            }
          }
        );
      } else {
        console.log ("Incomplete specification: provide graders and tests.".error);
        process.exit (-1);
      }
    }
  });
}

function wait_for_graders(graders, cb) {
  var opts = {
    resources: Object.keys(graders).map((grader_name) => {
        return `http://${grader_name}:${graders[grader_name].port}${graders[grader_name].mark}`;
      }).concat(['http://grader-tester:3000/healthy']).concat(['http://git-server/ping']),
    delay: 1000, // initial delay in ms, default 0
    interval: 100, // poll interval in ms, default 250ms
    timeout: 30000, // timeout in ms, default Infinity
    window: 1000, // stabilization time in ms, default 750ms
    strictSSL: false,
    followAllRedirects: true,
    followRedirect: true
  };

  console.log("Waiting for graders, git server, and grader-tester server to spin up...".log);
  waitOn(opts, (err) => {
    if (err) {
      console.log("Issue waiting for graders. Are they all responding to HEAD requests on their mark endpoints?".error);
      cb(err, []);
      return;
    }

    // once here, all resources are available
    console.log("All graders are up.".log);
    cb(null, []);
  });
}

function run_tests(graders, tests, cb) {
  async.mapSeries(Object.keys(tests),
    (test, cb) => {
      console.log ('Running test '.log + test.yellow + '.'.log);

      for (var subindex in Object.keys(tests[test].submissions)){
        var gradertestspec = JSON.parse(JSON.stringify(tests[test]));
        gradertestspec.submission = tests[test].submissions[subindex];
        delete tests[test].submissions;
        for (var grader in tests[test].graders){
          console.log(grader);
          console.log(tests[test].graders[grader]);
          gradertestspec.graders[grader].mark = tests[test].graders[grader].marks[subindex];
          gradertestspec.graders[grader].feedback = tests[test].graders[grader].feedbacks[subindex]
          delete tests[test].graders[grader].feedbacks;
          delete tests[test].graders[grader].marks
        }
        var sha = []
        async.series({
          sha: (cb) => { get_submission_sha(sha, gradertestspec.submission, cb); },
          tests: (cb) => { run_graders(gradertestspec.graders, gradertestspec.submission, sha, graders, cb); }
        },
        (err, results) => {
          if (err) {
            cb(err, results.tests);
          } else {
            console.log ('Finished running test '.log + test.yellow + '.'.log);
            cb(null, results.tests);
          }
        }
      );
      }
    },
    cb
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
  console.log(`  Ready to run graders on SHA ${sha[0]}.`.log);

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

  async.mapSeries(Object.keys(grader_test_specs),
    (grader_test_spec, cb) => {
      console.log(`  About to run test for ${grader_test_spec}.`.log);
      run_grader(grader_test_spec, grader_test_specs[grader_test_spec], submission_request_body, graders[grader_test_spec], cb);
    },
    cb
  );
}

function run_grader(grader_name, grader_test_spec, submission_request_body, grader_spec, cb) {
  async.series({
      configure: (cb) => { configure_test_for (grader_spec, grader_test_spec, submission_request_body, cb); },
      invoke: (cb) => { do_invoke_grader (grader_name, grader_test_spec, submission_request_body, grader_spec, cb); },
      results: (cb) => { wait_for_test_results (grader_spec.canonical_name, grader_test_spec, submission_request_body.sid, cb); }
    },
    (err, data) => {
      var result = {};
      if (err) {
        cb(err);
      } else {
        var test_result = data.results;
        if (test_result.is_complete) {
          result['mark_correct'] = test_result.mark.is_correct;
          if (test_result.mark.is_correct) {
            console.log("    " + test_result.mark.message.good);
          } else {
            console.log("    " + test_result.mark.message.error);
          }

          result['feedback_correct'] = test_result.feedback.is_correct;
          if (test_result.feedback.is_correct) {
            console.log("    " + test_result.feedback.message.good);
          } else {
            console.log("    " + test_result.feedback.message.error);
          }

          cb(null, result);
        } else {
          // Really strange: Why did we receive this in the first place, then?
          cb("    Received incomplete test result.");
        }
      }
    }
  );
}

function configure_test_for (grader_spec, grader_test_spec, submission, cb) {
  const requestOptions = {
    url: `http://grader-tester:3000/tests/configure/${submission.sid}/${grader_spec.canonical_name}`,
    method: 'POST',
    json: true,
    body: {...grader_test_spec, feedback: get_feedback_html(grader_test_spec.feedback)}
  };

  request(requestOptions, (err, res, body) => {
    if (err) {
      console.log(`    Could not configure test server: ${err}.`.error);
      cb(err);
    } 
    else if (res.statusCode != 200){
      console.log(`    Received non-200 return from test server: ${body}.`.error);
      cb(`Received non-200 return from test server: ${body}.`);
    }
    else if (grader_spec.configuration){
      setup_configuration(grader_spec, grader_test_spec, submission, cb);
    }
    else {
      cb();
    }
  });
}

function get_submission_sha_sync(repo_name) {
  const data = fs.readFileSync(`/repositories/${repo_name}.git/packed-refs`, 'utf8');
  return /^([A-Za-z0-9]+)\s+refs\/heads\/master$/m.exec(data)[1]
}

function setup_configuration(grader_spec, grader_test_spec, submission, cb){
  const grader_name = grader_spec.canonical_name;

  for (var configkey in grader_test_spec.configuration){
    if (grader_test_spec.configuration[configkey]["repository"]){
      const repo_name = grader_test_spec.configuration[configkey]["repository"]
      grader_test_spec.configuration[configkey] = {
        repository: `${GIT_BASE_URL}${repo_name}.git`,
        sha: get_submission_sha_sync(repo_name),
        branch: "master"
      }
    }
  }

  const requestOptions = {
    url: `http://${grader_name}:${grader_spec.port}${grader_spec.configuration}`,
    method: 'POST',
    json: true,
    body: {
      aid: submission.aid,
      config: grader_test_spec.configuration,
    }
  };
  request(requestOptions, (err, res, body) => {
    if (err) {
      console.log(`Retrieved error from call to ${grader_name}: ${err}.`.error);
      cb(err);
    } else {
      if (res.statusCode == 200) {
        console.log(`${grader_name} reports successfully receiving configuration with sha ${grader_test_spec.configuration.test_files.sha}.`.good);

        // wait a bit for the grader to put it in the database
        setTimeout(() => {
          test_config(grader_spec, grader_test_spec, submission, cb)
        }, 100)
      } else {
        console.log(`    Received non-200 return from ${grader_name}: ${body}.`.error);
        cb(`Received non-200 return from ${grader_name}: ${body}.`);
      }
    }
  });
}

function test_config(grader_spec, grader_test_spec, submission, cb){
  const grader_name = grader_spec.canonical_name;

  const requestOptions = {
    url: `http://${grader_spec.canonical_name}:${grader_spec.port}${grader_spec.configuration}?${submission.aid}`,
    method: 'GET',
    json: true,
    qs: {aid: submission.aid}, 
    queries: {aid: submission.aid},
  };
  request(requestOptions, (err, res, body) => {
    if (err) {
      console.log(`    Retrieved error from call to ${grader_name}: ${err}.`.error);
      cb(err);
    } else {
      if (res.statusCode == 200) {
        if (JSON.stringify(body.config) == JSON.stringify(grader_test_spec.configuration)){
          console.log (`Received correct configurations back from ${grader_name}.`.good)
          cb();
        }
        else {
          console.log(`Did not receive expected configurations from ${grader_name}.`);
          cb(`Did not receive expected configurations from ${grader_name}: ${JSON.stringify(body)} but expected ${JSON.stringify(grader_test_spec.configuration)}.`);
        }
      } else {
        console.log(`    Received non-200 return from ${grader_name}: ${body}.`.error);
        cb(`Received non-200 return from ${grader_name}: ${body}.`);
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
      console.log(`    Retrieved error from call to ${grader_name}: ${err}.`.error);
      cb(err);
    } else {
      if (res.statusCode == 200) {
        console.log(`    ${grader_name} reports successfully receiving the submission.`.good);
        cb();
      } else {
        console.log(`    Received non-200 return from ${grader_name}: ${body}.`.error);
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
      console.log(`    Error retrieving test results: ${err}.`.error);
      cb(err);
    } else {
      if (res.statusCode == 200) {
        cb(null, JSON.parse(body));
      } else {
        console.log(`    Received non-200 return from test server: ${body}.`.error);
        cb(`Received non-200 return from test server: ${body}.`);
      }
    }
  });
}

function get_feedback_html(feedback){
  if (feedback == "dontcare") {
    return feedback;
  }

  if (feedback["text"]){
    return feedback["text"];
  }

  if (feedback["file"]){
    var data = "";
    try {
      data = fs.readFileSync(`/test-specs/feedback/${feedback["file"]}.html`, 'utf8');
      console.log("Successfully found relevant feedback html file");
    }
    catch (err) {
      // tbh, there's no point in halting the tests at this point
      console.log("Failed to read from file. Using default empty string".error);
    }
    finally{
      return data; 
    }
  }

  // else ...
  console.log("Did find specifications for feedback. Using default empty string".error)
}