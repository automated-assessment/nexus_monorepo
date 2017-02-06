/**
 * Created by adamellis on 06/02/2017.
 */
var express = require('express');
var port = 3050;
var app = express();

app.use('/app',express.static(__dirname + '/app'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/node_modules',express.static(__dirname + '/node_modules'));

app.get('/',function(req,res){
   res.sendFile(__dirname + '/index.html');
});

app.listen(port,function(){
    console.log("Listening on port " + port);
});