var express = require('express');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');

const app = express();
const port = 3009;
const accessToken = process.env.NEXUS_ACCESS_TOKEN || "foo";

app.use(bodyParser.json());
app.use(errorhandler({
    dumpExceptions: true,
    showStack: true
}));

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
		
        //TODO Aydin: Put acanycess token here as well for auth.
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
