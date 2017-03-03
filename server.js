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
const configurationController = require(__dirname + '/server/controllers/configuration-controller.js');
const submissionController = require(__dirname + '/server/controllers/submission-controller.js');
const providerController = require(__dirname + '/server/controllers/provider-controller.js');
const receiverController = require(__dirname + '/server/controllers/receiver-controller.js');
const allocationController = require(__dirname + '/server/controllers/allocation-controller.js');
const academicController = require(__dirname + '/server/controllers/academic-controller.js');




mongoose.connect(`mongodb://${dbHost}/peerfeedback`);

app.use(cors({origin:'http://localhost:3000'}));
app.use(bodyParser.json());
app.use('/app',express.static(__dirname + '/app')); //change to public to fit convention
app.use('/css',express.static(__dirname+'/css'));
app.use('/node_modules',express.static(__dirname+'/node_modules'));

debugRoutes();


app.get('/',function(req,res){
   res.sendFile(__dirname + '/index.html');
});

//Create Submission
app.post('/mark',submissionController.createSubmission);

app.get('/api/response',function(req,res){
    res.set({"Access-Control-Allow-Origin":"*"});
    res.sendFile(__dirname + "/index.html");
});

//Academic
app.get('/api/academic/getAllSubmissions',academicController.getAllSubmissions);

//Configuration
app.get('/api/configuration/getAssignmentConfig',configurationController.getAssignmentConfig);
app.post('/api/configuration/postAssignmentConfig',configurationController.saveAssignmentConfig);

//Response
app.get('/api/allocation/getReceivedFrom',allocationController.getReceivedFrom);


app.get('/api/allocation/getProvideTo', allocationController.getProvideTo);

//Provider
app.get('/api/provider/getSubmission',providerController.getSubmission);
app.post('/api/provider/saveForm',providerController.saveForm);

//Receiver
app.get('/api/receiver/getForm',receiverController.getForm);

app.listen(port,function(){
    console.log(`Listening on port: ${port}`);
});

app.get('/test',function(req,res){
   res.send(200);
});

function debugRoutes(){
    app.use(function (req, res, next) {
        console.log(req.method, req.url, req.body);
        next();
    });
};