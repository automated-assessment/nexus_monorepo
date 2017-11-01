import {
  handle_receive_mark,
  handle_receive_feedback,
  handle_configure_test,
  handle_test_results_request } from './request_handlers';

var express = require('express');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');

const app = express();
const port = process.env.PORT || 3000;

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(errorhandler({
    dumpExceptions: true,
    showStack: true
}));

// Health check
app.head('/healthy', (request, response) => {
  response.sendStatus(200);
});

// Standard Nexus endpoints
app.post('/report_mark/:sid/:tool_uid', jsonParser, handle_receive_mark);
app.post('/report_feedback/:sid/:tool_uid', jsonParser, handle_receive_feedback);

// Setup tests and wait for results
app.post('/tests/configure/:sid/:tool_uid', jsonParser, handle_configure_test);
app.get('/tests/results/:sid/:tool_uid', urlencodedParser, handle_test_results_request)

app.listen(port, function () {
    console.log('Grader testing tool listening on port: ' + port);
});
