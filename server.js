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

//Begin: Not my code
process.on('SIGINT', function() {
    process.exit();
});
//End: Not my code


const app = express();

//Initialise app router
app.use(passport.initialize());
app.use(bodyParser.json());
app.use('/app',express.static(__dirname + '/app'));
app.use('/css',express.static(__dirname+'/css'));
app.use('/node_modules',express.static(__dirname+'/node_modules'));

passport.use('basic',passportUtils.studentStrategy);
passport.use('academic',passportUtils.academicStrategy);
const studentAuth = passport.authenticate('basic',{session:false});
const academicAuth = passport.authenticate('academic',{session:false});
const academicThenStudentAuth = passport.authenticate(['academic','basic'],{session:false});


//A POST request to create a single submission, this is the entrypoint for Nexus.
//No authentication possible.
app.post('/mark',submissionsController.createSubmission);

//Submissions
//A GET request for a single submission, specified by an SID.
//Can be authenticated as an academic or student.
app.get('/api/submissions/:sid',academicThenStudentAuth,submissionsController.getOneSubmission);
//A GET request for a student's provider's submissions, specified by the SID of the receiver.
//Can be authenticated as an academic or student.
app.get('/api/submissions/providers/:receiverSid',academicThenStudentAuth,submissionsController.getProviders);
//A GET request for a student's receiver's submissions, specified by the SID of the provider.
//Can be authenticated as an academic or student.
app.get('/api/submissions/receivers/:providerSid',academicThenStudentAuth,submissionsController.getReceivers);

//Allocations
//A GET request for an allocation (relational data) between two students, specified by a receiverSID and a providerSID.
//Can be authenticated as an academic or student.
app.get('/api/allocations/:receiverSid/:providerSid',academicThenStudentAuth,allocationsController.getOneAllocation);
//A PUT request, updating an allocation (relational data) between two students, specified by a receiverSID and a providerSID.
//Can be authenticated as a student.
app.put('/api/allocations/:receiverSid/:providerSid',studentAuth,allocationsController.updateAllocation);

//Assignments
//A GET request for all assignments
//No authentication necessary
app.get('/api/assignments',assignmentsController.getAllAssignments);
//A GET request for one assignment, specified by the AID of the academic.
//Can be authenticated by an academic.
app.get('/api/assignments/:aid',assignmentsController.getOneAssignment);
//A GET request for all submissions belonging to an assignment, specified by an AID.
//Can be authenticated as an academic.
app.get('/api/assignments/:aid/submissions',academicAuth,submissionsController.getAssignmentSubmissions);
//A PUT request for all assignments, specified by AID.
//Can be authenticated as an academic.
app.put('/api/assignments/:aid',academicAuth,assignmentsController.updateAssignment);
//A GET request for a GitHub submission, specified by the SID of the submission.
//Can be authenticated as an academic or student.
app.get('/api/git/:sid',academicThenStudentAuth,gitController.getGitSubmission);


app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});

app.listen(port,function(){
    console.log(`Listening on port: ${port}`);
});
