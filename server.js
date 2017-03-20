/**
 * Created by adamellis on 06/02/2017.
 */

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bodyParser = require('body-parser');



const app = express();

const port = process.env.PORT || 5000;
const dbHost = process.env.DB_HOST || localhost;
const submissionsController = require(__dirname + '/server/controllers/submissions-controller.js');
const assignmentsController = require(__dirname + '/server/controllers/assignments-controller.js');
const allocationsController = require(__dirname + '/server/controllers/allocations-controller.js');
const gitController = require(__dirname + '/server/controllers/git-controller.js');




mongoose.connect(`mongodb://${dbHost}/peerfeedback`);

app.use(bodyParser.json());
app.use('/app',express.static(__dirname + '/app')); //change to public to fit convention
app.use('/css',express.static(__dirname+'/css'));
app.use('/node_modules',express.static(__dirname+'/node_modules'));

// debugRoutes();



//Submissions
app.get('/api/submissions',submissionsController.getAllSubmissions);
app.get('/api/submissions/:sid',submissionsController.getOneSubmission);
app.get('/api/submissions/:sid/git',submissionsController.getGitData);
//probably better ways to build this api
app.post('/mark',submissionsController.createSubmission);

app.get('/api/allocations/providers/:receiverSid',allocationsController.getProviders);
app.get('/api/allocations/receivers/:providerSid',allocationsController.getReceivers);
app.put('/api/allocations/:receiverSid/:providerSid',allocationsController.updateAllocation);
app.get('/api/allocations/:receiverSid/:providerSid',allocationsController.getOneAllocation);

//Assignments
app.get('/api/assignments',assignmentsController.getAllAssignments);
app.get('/api/assignments/:aid',assignmentsController.getOneAssignment);
app.get('/api/assignments/:aid/submissions',submissionsController.getAssignmentSubmissions);
app.put('/api/assignments/:aid',assignmentsController.updateAssignment);

app.get('/api/git/:repo/:branch',gitController.getArchiveLink);


app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});

app.get('http://www.google.com',function(req,res){
    console.log("Hitting google");
});


function debugRoutes(){
    app.use(function (req, res, next) {
        console.log(req.method, req.url, req.body);
        next();
    });
}

app.listen(port,function(){
    console.log(`Listening on port: ${port}`);
});