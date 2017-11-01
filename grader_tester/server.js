import {
  handle_receive_mark,
  handle_receive_feedback } from './request_handlers';

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

app.post('/report_mark/:sid/:tool_uid', jsonParser, handle_receive_mark);
app.post('/report_feedback/:sid/:tool_uid', jsonParser, handle_receive_feedback);

app.listen(port, function () {
    console.log('Grader testing tool listening on port: ' + port);
});
