/**
 * Created by adamellis on 06/02/2017.
 */

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bodyParser = require('body-parser');
const cors = require('cors');



const app = express();

const port = process.env.PORT || 5000;
const dbHost = process.env.DB_HOST || localhost;
const submissionsController = require(__dirname + '/server/controllers/submissions-controller.js');
const assignmentsController = require(__dirname + '/server/controllers/assignments-controller.js');




mongoose.connect(`mongodb://${dbHost}/peerfeedback`);

app.use(bodyParser.json());
app.use('/app',express.static(__dirname + '/app')); //change to public to fit convention
app.use('/css',express.static(__dirname+'/css'));
app.use('/node_modules',express.static(__dirname+'/node_modules'));

debugRoutes();



//Create Submission


// app.get('/api/response',function(req,res){
//     res.set({"Access-Control-Allow-Origin":"*"});
//     res.sendFile(__dirname + "/index.html");
// });

//Submissions
app.get('/api/submissions',submissionsController.getAllSubmissions);
app.get('/api/submissions/:aid',submissionsController.getSubmissions);
app.get('/api/submissions/providers/:receiversid',submissionsController.getSubmissionProviders);
app.get('/api/submissions/receivers/:providersid',submissionsController.getSubmissionReceivers);
app.post('/mark',submissionsController.createSubmission);
app.get('/api/submissions/providers/:receiversid/:providersid',submissionsController.getSubmissionRelation);
app.put('/api/submissions/providers/:receiversid/:providersid',submissionsController.updateProviderForm);


//Assignments
app.get('/api/assignments',assignmentsController.getAllAssignments);
app.get('/api/assignments/:aid',assignmentsController.getOneAssignment);
app.put('/api/assignments/:aid',assignmentsController.updateAssignment);

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
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