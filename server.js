var express = require('express');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var fs = require('fs');

const app = express();
const port = 3009;
const accessToken = process.env.NEXUS_ACCESS_TOKEN;
const NEXUS_BASE_URL = process.env.NEXUS_BASE_URL || 'http://localhost:3000';

if (!process.env.NEXUS_ACCESS_TOKEN) {
  console.log('Error: Specify NEXUS_ACCESS_TOKEN in environment');
  process.exit(1);
}

//TODO Aydin: Solely for initial generation functionality. Values will be fetched from db in later stages
var valueArray = new Array();
valueArray.push(new Array());
valueArray.push(new Array());
valueArray.push(new Array());

app.use(bodyParser.json());
app.use(errorhandler({
    dumpExceptions: true,
    showStack: true
}));

app.post('/desc_gen', function (request, response) {
    console.log('Unique assignment desscription generation request received.');
	console.log(`Request for generating description for assignment with id: ${request.body.aid},
	for student with id: ${request.body.studentid}`);
	
	var studentID = request.body.studentid;
	var descriptionString = request.body.description_string;
	
	//Collecting template parameters and their desired types
	var parameterStr = request.body.parameter_string;
	var parameterPairs = parameterStr.split([',']);
	var parameterNameArr = new Array();
	var parameterTypeArr = new Array();

	for(var i = 0; i < parameterPairs.length; i++) {
		parameterNameArr[i] = parameterPairs[i].split(':')[0];
		parameterTypeArr[i] = parameterPairs[i].split(':')[1];
	}
	
	var lineReader1 = require('readline').createInterface({
	  input: require('fs').createReadStream(process.cwd()+'/1')
	});

	lineReader1.on('line', function (line) {
	  valueArray[1].push(line);
	});

	var lineReader2 = require('readline').createInterface({
	  input: require('fs').createReadStream(process.cwd()+'/1')
	});

	lineReader2.on('line', function (line) {
	  valueArray[2].push(line);
	});
	
	console.log(valueArray);

	//TODO Aydin: Do generation.

	console.log(`Sent description for assignment with id:{request.body.aid},
	for student with id: ${request.body.studentid}`);
	response.send('Unique generation is still under construction.');
})

app.post('/unique_gen', function (request, response) {
    console.log('Unique assignment file generation request received.')
    if(request.headers["nexus-access-token"] == accessToken) { 
        console.log(`Request for fetching files to mark assignment ${request.body.aid}, 
        submission id: ${request.body.sid},
        for student with id: ${request.body.studentuid}`);
		
		//Collecting template parameters and their desired types
		var parameterStr = request.body.parameter_string;
		var parameterPairs = parameterStr.split([',']);
		var parameterNameArr = new Array();
		var parameterTypeArr = new Array();
		
		for(var i = 0; i < parameterPairs.length; i++) {
			parameterNameArr[i] = parameterPairs[i].split(':')[0];
			parameterTypeArr[i] = parameterPairs[i].split(':')[1];
		}
		
		for(var i = 0; i < parameterPairs.length; i++) {
			console.log(parameterNameArr[i] + " : " + parameterTypeArr[i]);
		}
		
        //TODO Aydin: Do generation.
        //TODO Aydin: Put generated files
		
        //TODO Aydin: Put access token here as well for auth.
        console.log('Sent Hello World, ish...');
        response.send('Unique generation is still under construction.');
    }
    else {
      console.log('Token error. The token:');
      console.log(request.headers["nexus-access-token"])
      response.send('Invalid token!');
    }
})

app.listen(port, function () {
    console.log('Test UAT listening on port: ' + port);
})
