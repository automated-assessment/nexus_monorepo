var	fs = require('fs');
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

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
		var javaExecute = spawnSync('java', [nameOfFile], {
		// input: "test",
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
			console.log(javaExecute.stdout.toString());
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

main();