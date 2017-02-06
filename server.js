/**
 * Created by adamellis on 06/02/2017.
 */


var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var formController = require(__dirname + '/server/controllers/form-controller.js');
var app = express();
var port = 3050;



mongoose.connect('mongodb://localhost/peerfeedback');

app.use(bodyParser.json());
app.use('/app',express.static(__dirname + '/app'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/node_modules',express.static(__dirname + '/node_modules'));

app.get('/',function(req,res){
   res.sendFile(__dirname + '/index.html');
});

app.post('/api/config/create',formController.createConfig);
app.listen(port,function(){
    console.log("Listening on port " + port);
});