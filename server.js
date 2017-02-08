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
console.log(port);
const formController = require(__dirname + '/server/controllers/form-controller.js');
const allocationController = require(__dirname + '/server/controllers/allocation-controller.js');
const sender = require('./server/send-request');



mongoose.connect(`mongodb://${dbHost}/peerfeedback`);

app.use(bodyParser.json());
app.use('/app',express.static(__dirname + '/app'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/node_modules',express.static(__dirname + '/node_modules'));

app.get('/',function(req,res){
   res.sendFile(__dirname + '/index.html');
});

app.post('/api/config/create',formController.createConfig);


app.post('/mark',function(req,res,next){
    allocationController.createSubmission(req,res,next);
    res.status(200).send();
    sender.sendMark(10, req.body.sid,function(err,res,body){
    });

    const html = "<div>Working</div>";
    sender.sendFeedback(html,req.body.sid,function(err,res,body){
    });

});

app.listen(port,function(){
    console.log(`Listening on port: ${port}`);
});

