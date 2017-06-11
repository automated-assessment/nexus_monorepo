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
	var error = false;
	
    console.log('Unique assignment desscription generation request received.');
	console.log(`Request for generating description for assignment with id: ${request.body.aid}, for student with id: ${request.body.studentid}`);
	
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
	
	//TODO Aydin: Values will be fetched from db or sth else in later stages
	var lineReader1 = require('readline').createInterface({
	  input: require('fs').createReadStream(process.cwd()+'/1')
	});

	lineReader1.on('line', function (line) {
	  valueArray[1].push(line);
	}).on('close', function() {
		var lineReader2 = require('readline').createInterface({
		  input: require('fs').createReadStream(process.cwd()+'/2')
		});

		lineReader2.on('line', function (line) {
		  valueArray[2].push(line);
		}).on('close', function() {
			
		  //Writing the template to file to do generation
		  var writeFs = require('fs');
		  writeFs.writeFile(process.cwd()+'/description.py.dna',descriptionString, function(err) {
		  	console.log('Error from writing dna file: ' + err);
			if (err != null) {
				error = true;
		  	    response.send('Something went wrong inside the system. Contact your lecturer for further queries. ERROR STEP 1');
			}
		  })
		  
		  if (!error) {
			//Executing generation with inputs
			console.log('Starting on generation')
	      	var pythonExec = require('python-shell');

		    var argsList = ['description.py.dna'];
		    for(var i = 0; i < valueArray[studentID].length; i++) {
			  argsList.push(valueArray[studentID][i]);
		    }

		    var options = {
			  args: argsList			  
		    }
            
			console.log('Generation args taken.')
			
		    pythonExec.run('/ribosome.py', options, function (err, results) {
			    if (err) {
				    console.log(err);
				    response.send('Something went wrong inside the system. Contact your lecturer for further queries. ERROR STEP 2');
			    }
			    else {
				  console.log('results: %j', results);
				  console.log(`Sent description for assignment with id: ${request.body.aid}, for student with id: ${request.body.studentid}`);
				  response.send(results[0]);
			    }
			});
		  }
		});
	});
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







