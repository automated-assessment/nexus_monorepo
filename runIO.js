var	fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');

//Library for linux commands. e.g javac
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

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
	var input = req.body.input;
	var output = req.body.output;
	var code = req.body.code;
	var className = "HelloWorld";

	var objToReturn = {
		compiled: {
			bool: true,
			error: ""
		},
		resultsArray: []
	}
	//Create Java File
	createJavaFile(code, className, '.java');

	//Compile source
	objToReturn = compileSource('TestingEnvironment', className, objToReturn);
	
	//Evaluate source
	objToReturn = executeCode(input, output, code, className, 'TestingEnvironment', objToReturn);

	//Delete Files (java + class) 
	deleteFiles('TestingEnvironment' , className);

	res.json(objToReturn);
});
///////////////////////////////////////////EDUCATOR HTTP Requests: END////////////////////////////

///////////////////////////////////////////STUDENT HTTP Requests: BEGIN////////////////////////////
//Student check-code POST REQUEST. 

app.post('/check-student-code', function(req, res) {
	//Variables to be given by Nexus
	var url = "https://github.com/GeorgeRaduta/IO-Tool-Repo-Test";
	var path = "sources";
	//

	var objToReturn = {
		compiled: {
			bool: true,
			error: ""
		},
		resultsArray: []
	}
	// var objToReturn = cloneGitRepo()

	res.json("ceva");
});
// cloneGitRepo("https://github.com/GeorgeRaduta/IO-Tool-Repo-Test.git", "sources");
///////////////////////////////////////////STUDENT HTTP Requests: END////////////////////////////

//////////////////////////////////////////Functions to run for HTTP
function cloneGitRepo(url, pathToClone) {
	var test = "clone https://github.com/GeorgeRaduta/IO-Tool-Repo-Test.git";
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

function createJavaFile(code, className, nameOfExtension) {
	var nameOfFileExtension = className + nameOfExtension;
	fs.writeFileSync('TestingEnvironment/' + nameOfFileExtension, code);
}

function deleteFiles(path, className) {
	try {
		fs.unlinkSync('TestingEnvironment/' + className + '.class');
	} catch(err) {
		console.log(err);
	}	
	try {
		fs.unlinkSync('TestingEnvironment/' + className + '.java');
	} catch(err) {
		console.log(err);
	}
}

function compileSource(path, className, objToReturn) {
	var javacExecute = spawnSync('javac', [className + '.java'], {cwd:path, timeout:2000});
	if (!(javacExecute.status == 0)) {
		//get errors to the user
		if (!(javacExecute.stderr.toString() == "")) {
			objToReturn.compiled.bool = false;
			objToReturn.compiled.error = javacExecute.stderr.toString(); 
			return objToReturn;
			// printErrors(javacExecute.stderr.toString(), 'compiling');
		} else if (!(javacExecute.error == null)) {
			objToReturn.compiled.bool = false;
			objToReturn.compiled.error = javaExecute.error; 
			return objToReturn;
			// printErrors(javaExecute.error, 'compiling');
		} 
		else {
			objToReturn.compiled.bool = false;
			objToReturn.compiled.error = 'Unkwown Error';
			return objToReturn;
		}
	} else {
		return objToReturn;
	}
}

function executeCode(arrayOfInput, arrayOfOutput, code, className, path, objToReturn) {
	var numberOfTestsPassed = 0;
	//To execute for every single test provided by the educator
	for (var i = 0; i < arrayOfInput.length; ++i) {
		var inputTest = arrayOfInput[i];

		var javaExecute = spawnSync('java', [className], {
			input: inputTest,
			cwd:'TestingEnvironment', 
			timeout:2000
		}); 

		if (!(javaExecute.status == 0)) {
		//get errors to the user
			if (!(javaExecute.stderr.toString() == "")) {
				objToReturn.resultsArray[i] = {
					error: true,
					message: javaExecute.stderr.toString()
				}
			} else if (!(javaExecute.error == null)) {
				objToReturn.resultsArray[i] = {
					error: true,
					message: javaExecute.error
				}
			} 
			else {
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
	return objToReturn;
}
