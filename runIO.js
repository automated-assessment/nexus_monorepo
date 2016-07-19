var	fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

//Library for linux commands. e.g javac
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

//MongoDB
var mongojs = require('mongojs');
var dbAssignments = mongojs('assignments',['assignments']);

//Server
var app = express();
app.use(express.static(__dirname + "/static/"));

//HTTP Requests
app.use(bodyParser.json());
app.listen(3001);

console.log("Server running on http://localhost:3001/");
///////////////////////////////////////////EDUCATOR HTTP Requests: BEGIN////////////////////////////
//Educator check-code POST REQUEST
app.post('/check-educator-code', function(req, res) {
	var rawPath = 'TestingEnvironment/';
	var input = req.body.input;
	var output = req.body.output;
	var dataFilesArray = req.body.filesArray;
	var id = req.body.assignmentId;
	
	var objToReturn = {
		compiled: {
			bool: true,
			error: ""
		},
		resultsArray: []
	}

	//Create Educator Directory
	var mkdir = spawnSync('mkdir', [id], {cwd:rawPath, timeout:2000});

	var path = rawPath + id + '/';
	//Create Files with specified extension
	createFiles(dataFilesArray, '.java', id);

	//Get All Files with .extension Java
	var childFind = execSync('find . -name "*.java" > sources.txt', { cwd: path });
	
	//Compile source (path) using SpawnSync
	objToReturn = compileAllSources(path,objToReturn);

	//Evaluate main source
	objToReturn = executeEducatorCode(input, output, dataFilesArray[0], path, objToReturn);

	//Save in DB if ok
	if (objToReturn.allPassed == true) {
		//Insert in DB
		var assignment = {
			aid: req.body.assignmentId,
			inputArray: input,
			outputArray: output,
			dataFilesArray: dataFilesArray
		}
		dbAssignments.assignments.insert(assignment, function(err,docs) {});
	} else {
		//Do nothing
	}
	//Delete Files (java + class) 
	deleteFolder(path);

	res.json(objToReturn);
});
///////////////////////////////////////////EDUCATOR HTTP Requests: END////////////////////////////

///////////////////////////////////////////STUDENT HTTP Requests: BEGIN////////////////////////////
function simulate() {
	var body = {
        mark: -1
    };
	console.log("mark called");

	//Data for MongoDB
    // var objDb = {
    // 	sid: "1",
    // 	aid: "1",
    // 	cloneUrl: req.body.cloneUrl,
    // 	branch: req.body.branch,
    // 	sha: req.body.sha
    // };
    //Data to store on MongoDB
    var objToReturn = {
		compiled: {
			bool: true,
			error: ""
		},
		resultsArray: []
	}

    var pathToClone = "TestingEnvironment";
    var path = "TestingEnvironment/IO-Tool-Repo-Test/sources";
    // var cloneUrl = req.body.cloneUrl;
    var repoName = "";
    var className = "HelloWorld";

    //Clone Repo
    // cloneGitRepo(cloneUrl, pathToClone);
    cloneGitRepo("test", "Test");

    //Comopile Source from repo
	objToReturn = compileSource("TestingEnvironment/IO-Tool-Repo-Test/sources", "HelloWorld", objToReturn);
	var aid = "1";
	dbAssignments.assignments.findOne({aid : aid.toString()}, function(err, docs) {
		//Run and compare results	
		// console.log(docs);
		objToReturn = executeEducatorCode(docs.inputArray, docs.outputArray, className, path, objToReturn);
		body.mark = objToReturn.numberOfTestsPassed;
		deleteRepo("IO-Tool-Repo-Test");
		console.log(body);
		
	});


    //Delete repo from Testing environment
    
    // //Send Mark and Feedback to Nexus
    // //TODO REPLACE WITH ENV
    // var url = 'http://localhost:3000/report_mark/' + req.body.sid + '/iot';
    // var requestOptions = {
    //   url,
    //   method: 'POST',
    //   headers: {
    //   	//REPLACE WIH ENV
    //     'Nexus-Access-Token': 'LbMYPcNKz/0Amp7EhEWwFJvJ5+2GXpa4kxwjOo9oYRk='
    //   },
    //   json: true,
    //   body
    // };

    // request(requestOptions, function(err, res, body) {
    //     console.log(err);
    //     console.log(JSON.stringify(res));
    // });
}

// simulate();
app.post('/mark', function(req, res) {
    res.status(200).send('OK!');

    var body = {
        mark: 100
    };
	console.log("mark called");

	//Data for MongoDB
    var objDb = {
    	sid: req.body.sid,
    	aid: req.body.aid,
    	cloneUrl: req.body.cloneurl,
    	branch: req.body.branch,
    	sha: req.body.sha
    };
    //Data to store on MongoDB
    var objToReturn = {
		compiled: {
			bool: true,
			error: ""
		},
		resultsArray: []
	}
	console.log(objDb);

    var pathToClone = "TestingEnvironment";
    var path = pathToClone;
    var cloneUrl = req.body.cloneurl;
    var repoName = "";
    var className = "HelloWorld";
    console.log("Clonging" + cloneUrl);
    //Clone Repo
    cloneGitRepo(cloneUrl, pathToClone);

    //Comopile Source from repo
	// objToReturn = compileSource(path, className, objToReturn);
	
	// dbAssignments.assignments.findOne({aid : aid.toString()}, function(err, docs) {
		//Run and compare results	
		// objToReturn = executeEducatorCode(docs.inputArray, outputArray, className, path, objToReturn);
	// });

    //Delete repo from Testing environment
    // deleteRepo(repoName);

    //Send Mark and Feedback to Nexus
    //TODO REPLACE WITH ENV
    var url = 'http://localhost:3000/report_mark/' + req.body.sid + '/iot';
    var requestOptions = {
      url,
      method: 'POST',
      headers: {
      	//REPLACE WIH ENV
        'Nexus-Access-Token': 'L+vKIwPO/OFp8gMQYXItot3AQbgnUip5eMyPnbaoW0Y='
      },
      json: true,
      body
    };

    request(requestOptions, function(err, res, body) {
        console.log(err);
        console.log(JSON.stringify(res));
    });
});
///////////////////////////////////////////STUDENT HTTP Requests: END////////////////////////////

//////////////////////////////////////////Functions to run for Evaluation
function cloneGitRepo(url, pathToClone) {
	var gitClone = spawnSync('git', ['clone', url], 
		{
			cwd:'TestingEnvironment',
			timeout:2000
		});
	
	if (!(gitClone.status == 0)) {
		//get errors to the user
		if (!(gitClone.stderr.toString() == "")) {
			console.log(gitClone.stderr.toString());
		} else if (!(gitClone.error == null)) {
			console.log(gitClone.error);
		} 
		else {
			console.log("UE");
		}
	} else {
		console.log("Done");
	}
}

function deleteRepo(name) {
	var deleteRepo = spawnSync('rm', ['-r', '-f', name],
	{
		cwd: 'TestingEnvironment',
		timeout: 5000
	});
}

function createFiles(dataFilesArray, extension, userId) {
	for (var i = 0; i < dataFilesArray.length; ++i) {
		var nameOfFileExtension = dataFilesArray[i].class_name + extension;
		fs.writeFileSync('TestingEnvironment/'+userId+'/' + nameOfFileExtension, dataFilesArray[i].code);
	}
}

function deleteFolder(path) {
	console.log(path);
	try {
		var childRemove = execSync('rm -r ' + path, {timeout: 60000 });	
	} catch(err) {
		console.log(err);
	}	
}


//COMPILEEEEEE
function compileAllSources(path, objToReturn) {
	try {
		var childJavac = execSync('javac -Xlint:all @sources.txt 2>&1', { cwd: path, timeout: 60000 });	
		objToReturn.compiled = true;
		objToReturn.error = "";
	} catch (error) {
		objToReturn.compiled = false;
		objToReturn.error = error;
	}
	return objToReturn;
}
function compileSource(path, className, objToReturn) {
	var javacExecute = spawnSync('javac', [className + '.java'], {cwd:path, timeout:2000});
	if (!(javacExecute.status == 0)) {
		 if (!(javacExecute.error == null)) {
			objToReturn.compiled.bool = false;
			objToReturn.compiled.error = javacExecute.error; 
			return objToReturn;
		} else if (!(javacExecute.stderr.toString() == "")) {
			objToReturn.compiled.bool = false;
			objToReturn.compiled.error = javacExecute.stderr.toString(); 
			return objToReturn;
		} else {
			objToReturn.compiled.bool = false;
			objToReturn.compiled.error = 'Unkwown Error';
			return objToReturn;
		}
	} else {
		return objToReturn;
	}
}

function executeEducatorCode(arrayOfInput, arrayOfOutput, dataFileArray, path, objToReturn) {

	var numberOfTestsPassed = 0;
	var className = dataFileArray.class_name;
	//To execute for every single test provided by the educator
	for (var i = 0; i < arrayOfInput.length; ++i) {
		var inputTest = arrayOfInput[i];

		var javaExecute = spawnSync('java', [className], {
			input: inputTest,
			cwd: path, 
			timeout:2000
		}); 

		if (!(javaExecute.status == 0)) {
		//get errors to the user
			if (!(javaExecute.error == null)) {
				objToReturn.resultsArray[i] = {
					error: true,
					message: javaExecute.error
				}
			} else if (!(javaExecute.stderr.toString() == "")) {
				objToReturn.resultsArray[i] = {
					error: true,
					message: javaExecute.stderr.toString()
				}
			} else {
				objToReturn.resultsArray[i] = {
					error:true,
					message: "Unknown Error"
				}
			}
		} else {
			// No Errors Branch
			// Compare user's input with educator's input and provide feedback
			if (arrayOfOutput[i].localeCompare(javaExecute.stdout.toString()) == 0) {
				objToReturn.resultsArray[i] = {
					error: false,
					passed: true,
					output: javaExecute.stdout.toString(),
					expectedOutput: arrayOfOutput[i]
				}
				numberOfTestsPassed++;
			} else {
				objToReturn.resultsArray[i] = {
					error: false,
					passed: false,
					output: javaExecute.stdout.toString(),
					expectedOutput: arrayOfOutput[i]
				}
			}
		}
	}
	if (numberOfTestsPassed == arrayOfInput.length) {
		objToReturn.allPassed = true;
	} else {
		objToReturn.allPassed = false;
	}
	objToReturn.numberOfTestsPassed = numberOfTestsPassed;
	return objToReturn;
}

