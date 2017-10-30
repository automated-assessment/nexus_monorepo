import async from 'async';
import forEachOf from 'async/eachOf';
import series from 'async/series';
import yaml from 'node-yaml';

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
    
    console.log (`Finished running test ${test}.`);
  });
}
