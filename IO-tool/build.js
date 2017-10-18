var	fs = require('fs');
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

//get the current directory file
var javacExecute = spawnSync('pwd', [], {timeout:2000});
var path = javacExecute.stdout.toString();
var currentPath = (javacExecute.stdout.toString()).substring(0, javacExecute.stdout.toString().length - 1) + '/sourcesPath';

fs.writeFile(currentPath, path, function(err){
	if (!(err == null)) {
		console.log(err);
		console.log("Sorry");

	} else {
		console.log("Done");
	}
});

