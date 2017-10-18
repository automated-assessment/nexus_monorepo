var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


//Try Cloning

function cloneRepo() {
	console.log("Start");
	var url = "https://github.com/GeorgeRaduta/algorithms.git";
	var javacExecute = spawnSync('nodejs', ['test.js'], {timeout:2000});

	if (javacExecute.status == 0) {
		console.log("ecava");
		console.log(javacExecute.stdout.toString());	
	} else {
		console.log(javacExecute.error);
	}
}

