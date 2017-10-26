import { desc_gen_handler, grader_gen_handler, update_assignment_parameters_handler, remove_assignment_handler } from './request_handlers';

var express = require('express');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');

const app = express();
const port = 3009;
const NEXUS_BASE_URL = process.env.NEXUS_BASE_URL || 'http://localhost:3000';

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(errorhandler({
    dumpExceptions: true,
    showStack: true
}));

app.post('/param_update', jsonParser, update_assignment_parameters_handler);
app.post('/remove_assignment', jsonParser, remove_assignment_handler);

app.post('/desc_gen', jsonParser, desc_gen_handler);

app.post('/grader_gen', jsonParser, grader_gen_handler);

app.listen(port, function () {
    console.log('UAT listening on port: ' + port);
});
