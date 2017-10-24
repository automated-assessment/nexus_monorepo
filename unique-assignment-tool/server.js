import { desc_gen_handler, grader_gen_handler } from './request_handlers';

var express = require('express');
var sleeper = require('sleep');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var childProcess = require('child_process');
var fs = require('fs');
var cors = require('cors');
var wait = require('wait.for');
var async = require('async');

var paramString = "";

const app = express();
const port = 3009;
const NEXUS_BASE_URL = process.env.NEXUS_BASE_URL || 'http://localhost:3000';

import { mysql, dbcon, initDB } from './db_mgr';
initDB();

sleeper.sleep(30);

dbcon.connect(function(err) {
  if (err) {
	  console.log(err);
  }
  else {
	  console.log("DB connection successful.")
  }
});

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(errorhandler({
    dumpExceptions: true,
    showStack: true
}));

var corsOptions = {
  origin: '*',
  credentials: true,
  allowedHeaders: ['Content-Type','application/x-www-form-urlencoded'],
  optionsSuccessStatus: 200
};

function paramUploadStartHandler (request, response) {
  var sql = "CREATE TABLE assignments (assign_id INT, PRIMARY KEY (assign_id)) ENGINE=INNODB;";
  dbcon.query(sql, function (err, result) {
	if (err && err.code !== "ER_TABLE_EXISTS_ERROR") {
		console.log(err);
	}
	else {
	  console.log("Table Assignments is created for the database.");
	  sql = "CREATE TABLE parameters (param_id INT AUTO_INCREMENT, param_name VARCHAR(50)," +
			"param_type ENUM ('int','float','double','string','boolean'), param_construct TEXT, assign_id INT, PRIMARY KEY (para" +
			"m_id), FOREIGN KEY (assign_id) REFERENCES assignments(assign_id)) ENGINE=INNODB;";
	  dbcon.query(sql, function (err, result) {
	  if (err && err.code !== "ER_TABLE_EXISTS_ERROR") {
		 console.log(err);
	  }
	  else {
		 console.log("Table Parameters is created for the database.");
		 var sql = "CREATE TABLE generated_parameters (assign_id INT, std_id INT, param_name VARCHAR(50), param_value TEXT,"
		 		   + "FOREIGN KEY (assign_id) REFERENCES assignments(assign_id)) ENGINE=INNODB;";
		 dbcon.query(sql, function (err, result) {
		 if (err && err.code !== "ER_TABLE_EXISTS_ERROR") {
			 console.log(err);
		 }
		 else {
			 console.log("Table Generated Parameters is created for the database.");
	  		 response.send("Tables created.");
			 paramString = request.body.parameter_string;
		 }
	   });
	  }
	});
   }
 });
}

function paramUploadFinishHandler (request, response) {
  var assignmentID = request.body.aid;
  var parameterPairs = paramString.split(['|']);
  var parameterNameArr = new Array();
  var parameterTypeArr = new Array();
  var parameterConstructArr = new Array();
  paramString = "";

  for(var i = 0; i < parameterPairs.length; i++) {
	parameterNameArr.push(parameterPairs[i].split(':')[0]);
	parameterTypeArr.push(parameterPairs[i].split(':')[1]);
	parameterConstructArr.push(parameterPairs[i].split(':')[2]);
  }

  var sql = "INSERT INTO assignments VALUES (?)";
  var values = [assignmentID];
  dbcon.query(sql, [values], function (err, result) {
	if (err) {
	   console.log(err);
	}
	else {
	  for(var i = 0; i < parameterPairs.length; i++) {
		sql = "INSERT INTO parameters (param_name,param_type,param_construct,assign_id) VALUES (?)";
		var values = [parameterNameArr[i],parameterTypeArr[i],parameterConstructArr[i],assignmentID];
		dbcon.query(sql, [values], function (err, result) {
		  if (err) {
			 console.log(err);
		  }
		});
	  }
	  console.log("Parameters received.");
	  response.send("Data received.");
	}
  });
}

app.post('/param_upload_start', urlencodedParser, cors(corsOptions), function (request, response) {
  wait.launchFiber(paramUploadStartHandler,request, response);
});

app.post('/param_upload_finish', jsonParser, function (request, response) {
  wait.launchFiber(paramUploadFinishHandler,request, response);
});

app.post('/desc_gen', jsonParser, desc_gen_handler);

app.post('/grader_gen', jsonParser, grader_gen_handler);

app.listen(port, function () {
    console.log('UAT listening on port: ' + port);
});
