import async from 'async';
import forEachOf from 'async/eachOf';
import series from 'async/series';

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

  console.log ("All tests have run.");
  process.exit(0);
}
