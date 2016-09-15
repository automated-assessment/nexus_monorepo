var	fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var envVar = require('dotenv').config({silent: true});
//Library for linux commands. e.g javac
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

//GLOBAL VARIABLES
var PORT = process.env.PORT || 3001;
var RAW_PATH = process.env.RAW_PATH || 'TestingEnvironment';
var NEXUS_URL = process.env.NEXUS_URL || 'http://localhost:3000/';
var IOTOOL_ID = process.env.IOTOOL_ID || 'iotool';
var NEXUS_ACCESS_TOKEN = process.env.NEXUS_ACCESS_TOKEN;
var MONGO_HOST = process.env.MONGO_HOST || 'localhost';

//MongoDB
var mongojs = require('mongojs');
var dbAssignments = mongojs(`${MONGO_HOST}/assignments`, ['assignments']);
var dbDict = mongojs(`${MONGO_HOST}/dictionary`, ['dictionary']);
var dbTypeOne = mongojs(`${MONGO_HOST}/typeone`, ['typeone']);
var dbTypeTwo = mongojs(`${MONGO_HOST}/typetwo`, ['typetwo']);
var dbTypeThree = mongojs(`${MONGO_HOST}/typethree`, ['typethree']);

//Server
var app = express();
app.use(express.static(__dirname + "/static/"));

//HTTP Requests
app.use(bodyParser.json());

//Ensure correct reaction to Ctrl-C
process.on('SIGINT', function() {
    process.exit();
});

app.listen(PORT);
console.log("Server running on http://localhost:" + PORT + "/");
///////////////////////////////////////////EDUCATOR HTTP Requests: BEGIN////////////////////////////
//Educator check-code POST REQUEST
app.post('/check-educator-code', function(req, res) {
	var rawPath = RAW_PATH + '/';
	var input = req.body.input;
	var output = req.body.output;
	var feedback = req.body.description;
	var dataFilesArray = req.body.filesArray;
	var id = req.body.assignmentId;
	
	var objToReturn = {
		compiled: {
			bool: true,
			error: ""
		},
		resultsArray: []
	}

	//Create the Testing environment Folder
	var mkdir = spawnSync('mkdir', [RAW_PATH], {timeout:2000});
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
			feedbackArray: feedback,
			dataFilesArray: dataFilesArray
		}
		dbAssignments.assignments.insert(assignment, function(err,docs) {

		});
	} else {
		//Do nothing
	}
	//Delete Files (java + class) 
	deleteFolder(path);

	res.json(objToReturn);
});

app.get('/get-dictionaries', function(req,res) {
	dbDict.dictionary.find(function(err, docs){
		res.json(docs);
	});
});

app.get('/get-assignments', function(req,res) {
	objToReturn = {
		typeone: [],
		typethree: []
	}
	dbTypeOne.typeone.find(function(err, docs) {
		objToReturn.typeone = docs;
		dbTypeThree.typethree.find(function(err, docs) {
			objToReturn.typethree = docs;
			res.json(objToReturn);
		});
	});
});

app.get('/get-assignment-by-id', function(req, res) {
	console.log(req.params);
});

app.post('/add-new-dictionary', function(req, res) {
	dbDict.dictionary.insert(req.body.dictionary, function(err, docs) {
		if (err == null) {
			created = true;
			res.json("success");
		} else {
			res.json("database-error");
		}
	});
});


//Requests for Complex IO
app.post('/check-educator-code-no-input-no-output', function(req,res) {
	//HTTP POST Request that only tests if the file provided by the educator compiles and runs
	var rawPath = RAW_PATH + '/';
	var dataFilesArray = req.body.dataFilesArray;
	var id = req.body.id;
	
	var objToReturn = {
		compiled: {
			bool: false,
			error: ""
		},
		results: {
			ran: false,
			error: ""
		}
	}

	// Create Educator Directory
	var mkdir = spawnSync('mkdir', [id], {cwd:rawPath, timeout:2000});

	var path = rawPath + id + '/';
	//Create Files with specified extension
	createFiles(dataFilesArray, '.java', id);

	//Get All Files with .extension Java
	var childFind = execSync('find . -name "*.java" > sources.txt', { cwd: path });
	
	//Compile source (path) using SpawnSync
	objToReturn = compileAllSources(path,objToReturn);

	if (objToReturn.compiled) {
		//Evaluate main source if all sources compiled
		objToReturn = executeNiNoEducatorCode(dataFilesArray[0], path, objToReturn);
		res.json(objToReturn);
	} else {
		res.json(objToReturn);
	} 
	//Delete Files (java + class) 
	deleteFolder(path);
});

app.post('/save-assignment', function(req,res) {

	if (req.body.type == 1) {
		//Save in DB
		var objToInsert = {
			title: req.body.title,
			requirement: req.body.requirement,
			id: req.body.id,
			dataFilesArray: req.body.dataFilesArray
		}
		dbTypeOne.typeone.insert(objToInsert, function(err,docs) {
			if (err) {
				objToSend = {
					error: true,
					message: "MongoDB-Error"
				};
				res.json(objToSend);
			} else {
				objToSend = {
					error: false,
					message: "Assignment added Successfully"
				};
				res.json(objToSend)
			}
		});
	} else if (req.body.type == 3) {
		var objToInsert = req.body;
		dbTypeThree.typethree.insert(objToInsert, function(err,docs) {
			if (err) {
				objToSend = {
					error: true,
					message: "MongoDB-Error"
				};
				res.json(objToSend);
			} else {
				objToSend = {
					error: false,
					message: "Assignment added Successfully"
				};
				res.json(objToSend)
			}
		});
	} else {
		objToSend = {
			error: true,
			message: "Other Types missing"
		};
		res.json(objToSend);
	}

});


app.post('/check-educator-code-io-input-output', function(req,res) {
	var rawPath = RAW_PATH + '/';

	var knumber = req.body.id;
	var id = req.body.id;
	var inputArray = req.body.inputArray;
	var outputArray = req.body.outputArray;
	var correctOutputArray = outputArray;
	var descriptionArray = req.body.descriptionArray;
	var dictionariesArray = req.body.dictionariesArray;
	var dataFilesArray = req.body.dataFilesArray;

	//Obtain the proper output to compare
	for (var j = 0; j < correctOutputArray.length; ++j) {
		for (var i = 0; i < dictionariesArray.length; ++i) {
			var hash = "#" + (i+1);
			var re = new RegExp(hash,'g');
			correctOutputArray[j] = correctOutputArray[j].replace(re, dictionariesArray[i].dictionary.values[2]);
		}
	}

	var objToReturn = {
		compiled: {
			bool: false,
			error: ""
		},
		resultsArray: [],
		allPassed: false,
		numberOfTestsPassed: 0
	}

	// Create Educator Directory
	var mkdir = spawnSync('mkdir', [id], {cwd:rawPath, timeout:2000});

	var path = rawPath + id + '/';
	//Create Files with specified extension
	createFiles(dataFilesArray, '.java', id);

	//Get All Files with .extension Java
	var childFind = execSync('find . -name "*.java" > sources.txt', { cwd: path });
	
	//Compile source (path) using SpawnSync
	objToReturn = compileAllSources(path,objToReturn);

	if (objToReturn.compiled) {
		//Evaluate main source if all sources compiled
		objToReturn = executeEducatorCode(inputArray, outputArray, dataFilesArray[0], path, objToReturn);
		//Save in DB
		res.json(objToReturn);
	} else {
		res.json(objToReturn);
	}
	//Delete Files (java + class) 
	deleteFolder(path);

	

});
///////////////////////////////////////////EDUCATOR HTTP Requests: END////////////////////////////

///////////////////////////////////////////STUDENT HTTP Requests: BEGIN////////////////////////////

app.post('/mark', function(req, res) {
    
    var body = {
        mark: 0
    };

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
	};
	var cloneUrl = req.body.cloneurl;
	var userKNumber = cloneUrl.substring(8,16);
	var assignmentName = cloneUrl.substring(cloneUrl.indexOf('assignment'), cloneUrl.indexOf('.git'));

	var rawPath = RAW_PATH + "/";
    var path = rawPath + userKNumber;
    var pathAssingment = path + "/" + assignmentName;


    //Create the Testing environment Folder
	var mkdir = spawnSync('mkdir', [RAW_PATH], {timeout:2000});
    //Create folder only for this user in which we will create one for the assignment submission
    var mkdir = spawnSync('mkdir', [userKNumber], {cwd:rawPath, timeout:2000});

    //Clone Repo
    cloneGitRepo(cloneUrl, path);

    //Get All Files with .extension Java
	var childFind = execSync('find . -name "*.java" > sources.txt', { cwd: pathAssingment });
    
    //Comopile All Sources from repo
	objToReturn = compileAllSources(pathAssingment,objToReturn);

	//Search for assignment in db
	dbAssignments.assignments.findOne({aid : objDb.aid.toString()}, function(err, docs) {
		if (err) {
			sendRequest(urlF, {body: "error"});
		} else {
			//Run and compare results	
			objToReturn = executeStudentCode(docs.inputArray, docs.outputArray, docs.feedbackArray, docs.dataFilesArray[0].class_name, pathAssingment, objToReturn);
			
			//Delete repo from Testing environment
		    deleteFolder(pathAssingment);

		    //Send Mark to Nexus
		    body.mark = 100*objToReturn.numberOfTestsPassed / objToReturn.resultsArray.length;

			var url = NEXUS_URL + 'report_mark/'+ req.body.sid + '/' + IOTOOL_ID;
		    sendRequest(url, body);

		    //Send Feedback to Nexus
		    var bodyF = '';
		    var urlF = NEXUS_URL + 'report_feedback/' + req.body.sid + '/' + IOTOOL_ID;
		    if (body.mark == 100) {
			    bodyF = '<div class="javac-feedback"><p class="text-info" style="color:green"><b><i class="fa fa-check-circle" aria-hidden="true">&nbsp;</i>All tests passed correctly. Congrats!</b></p></div>';
			} else {
				bodyF = '<div class="javac-feedback">';
				for (var i = 0; i < docs.feedbackArray.length; ++i) {
					if (objToReturn.resultsArray[i].passed == false && objToReturn.resultsArray[i].error == false) {
						bodyF += '<p class="text-info" style="color:red"><label><i class="fa fa-times-circle" aria-hidden="true">&nbsp;</i>Test #' + i +' Failed</label></p>';
						bodyF += '<p class="text-info"><i>' + docs.feedbackArray[i] + '</i></p>'; 
					} else if (objToReturn.resultsArray[i].passed == true && objToReturn.resultsArray[i].error == false){
						bodyF += '<p class="text-info" style="color:green"><label><i class="fa fa-check-circle" aria-hidden="true">&nbsp;</i>Test #' + i +' Passed</label></p>';
					} else {
						bodyF += '<p class="text-info" style="color:red"><label><i class="fa fa-times-circle" aria-hidden="true">&nbsp;</i>Test #' + i +' Source did NOT RUN</label></p>';
					}
				}
				bodyF += '</div>';
			}	
			res.status(200).send('OK!');
			sendRequest(urlF, {body: bodyF});
		}
	});
});
///////////////////////////////////////////STUDENT HTTP Requests: END////////////////////////////

//////////////////////////////////////////Functions to run for Evaluation
function cloneGitRepo(url, pathToClone) {

	var gitClone = spawnSync('git', ['clone', url], 
		{
			cwd:pathToClone,
			timeout:2000
		});
	
	if (!(gitClone.status == 0)) {
		//get errors to the user
		if (!(gitClone.error == null)) {
			console.log(gitClone.error);
		} else
		if (!(gitClone.stderr.toString() == "")) {
			console.log(gitClone.stderr.toString());
		} 
		else {
			console.log("Unkwond Error");
		}
	} else {
		console.log("Done");
	}
}

function createFiles(dataFilesArray, extension, userId) {
	for (var i = 0; i < dataFilesArray.length; ++i) {
		var nameOfFileExtension = dataFilesArray[i].class_name + extension;
		fs.writeFileSync(RAW_PATH + '/' + userId + '/' + nameOfFileExtension, dataFilesArray[i].code);
	}
}

function deleteFolder(path) {
	try {
		var childRemove = execSync('rm -r ' + path, {timeout: 60000 });	
	} catch(err) {
		console.log(err);
	}	
}

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

function executeNiNoEducatorCode(dataFileArray, path, objToReturn){
	var className = dataFileArray.class_name;
	//To execute for every single test provided by the educator
	var javaExecute = spawnSync('java', [className], {
		cwd: path, 
		timeout:2000
	}); 

	if (!(javaExecute.status == 0)) {
		//get errors to the user
		if (!(javaExecute.error == null)) {
			objToReturn.results = {
				error: true,
				ran: false,
				message: javaExecute.error
			};
		} else if (!(javaExecute.stderr.toString() == "")) {
			objToReturn.results = {
				error: true,
				ran: false,
				message: javaExecute.stderr.toString()
			};
		} else {
			objToReturn.results = {
				error:true,
				ran: false,
				message: "Unknown Error"
			};
		}
	} else {
		objToReturn.results = {
			error: false,
			ran:true
		};
		objToReturn.allPassed = true;
	}
	return objToReturn;
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
					passed: false,
					message: javaExecute.error
				}
			} else if (!(javaExecute.stderr.toString() == "")) {
				objToReturn.resultsArray[i] = {
					error: true,
					passsed: false,
					message: javaExecute.stderr.toString()
				}
			} else {
				objToReturn.resultsArray[i] = {
					error:true,
					passed: false,
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

function executeStudentCode(arrayOfInput, arrayOfOutput, arrayOfFeedback, mainClassName, path, objToReturn) {
	var numberOfTestsPassed = 0;
	var className = mainClassName;

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
					passed: false,
					message: javaExecute.error
				}
			} else if (!(javaExecute.stderr.toString() == "")) {
				objToReturn.resultsArray[i] = {
					error: true,
					passed: false,
					message: javaExecute.stderr.toString()
				}
			} else {
				objToReturn.resultsArray[i] = {
					error:true,
					passed: false,
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
					expectedOutput: arrayOfOutput[i],
					feedback: "Test Passed. Good Job !"
				}
				numberOfTestsPassed++;
			} else {
				objToReturn.resultsArray[i] = {
					error: false,
					passed: false,
					output: javaExecute.stdout.toString(),
					expectedOutput: arrayOfOutput[i],
					feedback: arrayOfFeedback[i]
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

function sendRequest(url, body) {
	var requestOptions = {
	      url,
	      method: 'POST',
	      headers: {
	      	//REPLACE WIH ENV
	        'Nexus-Access-Token': NEXUS_ACCESS_TOKEN
	      },
	      json: true,
	      body
	    };

	request(requestOptions, function(err, res, body) {
		console.log(err);
		// console.log(JSON.stringify(res));
	});	
}
