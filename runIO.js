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
app.use(express.static(__dirname));
//HTTP Requests
app.use(bodyParser.json());
app.listen(3001);

console.log("Server running on http://localhost:3001/");

//STUDENT LOGOUT POST REQUEST
app.post('/check-educator-code', function(req, res) {
	console.log(req.body);
	var input = req.body.input;
	var output = req.body.output;
	var code = req.body.code;
	var className = "HelloWorld";
	//Evaluate source
	var results = getResultsCode(input, output, code, className);

	res.json(results);
	// res.json("Got it, cocos");
});

function getResultsCode(arrayOfInput, arrayOfOutput, code, className) {
	var objToReturn = {
		compiled: {
			bool: true,
			error: ""
		},
		resultsArray: []
	}
	var nameOfFileExtension = className + ".java";
	fs.writeFileSync('TestingEnvironment/' + nameOfFileExtension, code);
	//TODO : Add verification for correctly creating the file;

	//JAVAC 
	var javacExecute = spawnSync('javac', [nameOfFileExtension], {cwd:'TestingEnvironment', timeout:2000});
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
			// console.log('Unkown Error');
		}
	} else {
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
	}

	// //Delete files from testing environment
	// try {
	// 	fs.unlinkSync('TestingEnvironment/' + nameOfFile + '.class');
	// } catch(err) {
	// 	console.log(err);
	// }	
	// try {
	// 	fs.unlinkSync('TestingEnvironment/' + nameOfFile + '.java');
	// } catch(err) {
	// 	console.log(err);
	// }
	//Return error if compilation/runs fails
	if (numberOfTestsPassed == arrayOfInput.length) {
		objToReturn.allPassed = true;
	} else {
		objToReturn.allPassed = false;
	}
	return objToReturn;
}
//Functions to deal with evaluation
//TODO Queue implementation
function readPath() {
	fs.readFileSync('sourcesPath', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
  		// -1 to eliminate \n from the end
  		console.log("ceva");
  		console.log(data.substring(0, data.length - 1));
  	});
}

function main () {
	var mainPath = fs.readFileSync('sourcesPath', 'utf8')
	var pathSources = mainPath.substring(0, mainPath.length - 1) + 'DummySources';
	var pathTestingEnv = mainPath.substring(0, mainPath.length - 1) + 'TestingEnvironment';
	
	//Take argument from command nodejs runIO.js [name of File to test]
	var nameOfFile = process.argv[2];
	var nameOfFileExtension = nameOfFile + '.java';
	
	//Create JAVA File in Testing Environment
	var codeToAdd = fs.readFileSync('DummySources/' + nameOfFileExtension);
	fs.writeFileSync('TestingEnvironment/' + nameOfFileExtension, codeToAdd);
	//JAVAC 
	var javacExecute = spawnSync('javac', [nameOfFileExtension], {cwd:'TestingEnvironment', timeout:2000});
	if (!(javacExecute.status == 0)) {
		//get errors to the user
		if (!(javacExecute.stderr.toString() == "")) {
			printErrors(javacExecute.stderr.toString(), 'compiling');
		} else if (!(javacExecute.error == null)) {
			printErrors(javaExecute.error, 'compiling');
		} 
		else {
			console.log('Unkown Error');
		}
	} else {
		//To execute for every single test provided by the educator
		for (var i = 0; i < arrayOfInput.length; ++i) {
			var inputTest = arrayOfInput[i];

			var javaExecute = spawnSync('java', [nameOfFile], {
			// input: inputTest,
			cwd:'TestingEnvironment', 
			timeout:2000
			}); 

			if (!(javaExecute.status == 0)) {
			//get errors to the user
				if (!(javaExecute.stderr.toString() == "")) {
					printErrors(javaExecute.stderr.toString(), 'running');
				} else if (!(javaExecute.error == null)) {
					printErrors(javaExecute.error, 'running');
				} 
				else {
					console.log('Unkown Error');
				}
			} else {
				//No Errors Branch
				//Compare user's input with educator's input and provide feedback
				// var obj = {
				// 	index : i,
				// 	message: "Message",
				// 	result: output,
				// 	wrong: true/false
				// }
				console.log(javaExecute.stdout.toString());
			}
		}
	}

	//Delete files from testing environment
	try {
		fs.unlinkSync('TestingEnvironment/' + nameOfFile + '.class');
	} catch(err) {
		console.log(err);
	}	
	try {
		fs.unlinkSync('TestingEnvironment/' + nameOfFile + '.java');
	} catch(err) {
		console.log(err);
	}
}

function printErrors(param, when) {
	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!! BEGIN: Standard Erors while ' + when +' !!!!!!!!!!!!!!!!!!!!!!!!!!!!');
	console.log(param);
	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!! END: Standard Errors while ' + when + ' !!!!!!!!!!!!!!!!!!!!!!!!!!!!');
}

// main();