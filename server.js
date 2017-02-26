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
const configurationController = require(__dirname + '/server/controllers/configuration-controller.js');
const submissionController = require(__dirname + '/server/controllers/submission-controller.js');
const providerController = require(__dirname + '/server/controllers/provider-controller.js');
const receiverController = require(__dirname + '/server/controllers/receiver-controller.js');



mongoose.connect(`mongodb://${dbHost}/peerfeedback`);

app.use(bodyParser.json());
app.use('/app',express.static(__dirname + '/app'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/node_modules',express.static(__dirname + '/node_modules'));

app.get('/',function(req,res){
   res.sendFile(__dirname + '/index.html');
});

//Create Submission
app.post('/mark',submissionController.createSubmission);



//Academic
app.post('/api/configuration/saveForm',configurationController.createConfig);

//Provider
app.get('/api/provider/getSubmission',providerController.getSubmission);
app.get('/api/provider/getForm',providerController.getForm);
app.post('/api/provider/saveForm',providerController.saveForm);

//Receiver
app.get('/api/receiver/getForm',receiverController.getForm);

app.listen(port,function(){
    console.log(`Listening on port: ${port}`);
});

app.get('/test',function(req,res){
   res.status(200).send();
});

