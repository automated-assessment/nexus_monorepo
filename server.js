/**
 * Created by adamellis on 06/02/2017.
 */

require('dotenv').config();

//env
const port = process.env.PORT || 5000;
const dbHost = process.env.DB_HOST || "localhost";

//packages
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');

//locals
const passportUtils = require('./server/utilities/passport-utils');
const submissionsController = require(__dirname + '/server/controllers/submissions-controller.js');
const assignmentsController = require(__dirname + '/server/controllers/assignments-controller.js');
const allocationsController = require(__dirname + '/server/controllers/allocations-controller.js');
const gitController = require(__dirname + '/server/controllers/git-controller.js');


//configure mongoose
mongoose.Promise= global.Promise;
mongoose.connect(`mongodb://${dbHost}/peerfeedback`);


const app = express();

//Initialise app router
app.use(passport.initialize());
app.use(bodyParser.json());
app.use('/app',express.static(__dirname + '/app')); //change to public to fit convention
app.use('/css',express.static(__dirname+'/css'));
app.use('/node_modules',express.static(__dirname+'/node_modules'));
passport.use(passportUtils.studentStrategy);

const studentAuth = passport.authenticate('basic',{session:false});



//Submissions
app.get('/api/submissions',submissionsController.getAllSubmissions);
app.get('/api/submissions/:sid',studentAuth,submissionsController.getOneSubmission);
app.post('/mark',submissionsController.createSubmission);

app.get('/api/allocations/providers/:receiverSid',studentAuth,allocationsController.getProviders);
app.get('/api/allocations/receivers/:providerSid',studentAuth,allocationsController.getReceivers);

app.get('/api/allocations/:receiverSid/:providerSid',studentAuth,allocationsController.getOneAllocation);
app.put('/api/allocations/:receiverSid/:providerSid',studentAuth,allocationsController.updateAllocation);


//Assignments
app.get('/api/assignments',assignmentsController.getAllAssignments);
app.get('/api/assignments/:aid',assignmentsController.getOneAssignment);
app.get('/api/assignments/:aid/submissions',submissionsController.getAssignmentSubmissions);
app.put('/api/assignments/:aid',assignmentsController.updateAssignment);

app.get('/api/git/:receiverSid',gitController.getGitSubmission);


app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});

app.listen(port,function(){
    console.log(`Listening on port: ${port}`);
});

function debugRoutes(){
    app.use(function (req, res, next) {
        console.log(req.method, req.url, req.body);
        next();
    });
}