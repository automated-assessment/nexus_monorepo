var express = require('express');
var sleeper = require('sleep');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var childProcess = require('child_process');
var fs = require('fs');
var mysql = require('mysql');
var cors = require('cors');
var wait = require('wait.for');
var async = require('async');

var paramString = "";

const app = express();
const port = 3009;
const accessToken = process.env.NEXUS_ACCESS_TOKEN;
const NEXUS_BASE_URL = process.env.NEXUS_BASE_URL || 'http://localhost:3000';

if (!process.env.NEXUS_ACCESS_TOKEN) {
  console.log('Error: Specify NEXUS_ACCESS_TOKEN in environment');
  process.exit(1);
}

var dbcon = mysql.createConnection({
  host: process.env.MYSQL_HOST || "mysql",
  port: 3306,
  user: process.env.MYSQL_USER || "uat-tool",
  password: process.env.MYSQL_PASSWORD || "uat-pass",
  database: process.env.MYSQL_DATABASE || "uat"
});

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

app.post('/desc_gen', jsonParser, function (request, response) {
  console.log('Unique assignment description generation request received.');
  console.log(`Request for generating description for assignment with id: ${request.body.aid}, for student with id: ${request.body.studentid}`);

	var studentID = request.body.studentid;
	var assignmentID = request.body.aid;
	var descriptionString = request.body.description_string;

	//Fetching varialbes for particular assignment
	var sql = `SELECT param_name,param_type,param_construct FROM parameters WHERE assign_id = ${assignmentID};`;
	dbcon.query(sql, function (err, rows, result) {
    if (err) {
      console.log(err);
    }
    else {
      var parameterNameArr = new Array();
      var parameterTypeArr = new Array();
      var parameterConstructArr = new Array();

      for (var i in rows) {
        parameterNameArr.push(rows[i].param_name);
        parameterTypeArr.push(rows[i].param_type);
        parameterConstructArr.push(rows[i].param_construct);
      }

      //Appending variable-args assigning for generation commandline execution
      var appendingString = "";
      for(var i = 0; i < parameterNameArr.length; i++) {
        var index = i + 1;
        appendingString += parameterNameArr[i] + " = sys.argv[" + index.toString() + "];\n"
      }
      descriptionString = appendingString + descriptionString;

      var valueArray = new Array();
      for (var i = 0; i < parameterNameArr.length; i++) {
        var sql = `SELECT param_value FROM generated_parameters WHERE assign_id = ${assignmentID} and std_id = ${studentID} and param_name = "${parameterNameArr[i]}"`;
        dbcon.query(sql, function (err, rows, result) {
          if (err) {
            console.log(err);
          }
          else {
            if (rows.length == 0) {
              var value;
              var parameterBufferArray = parameterConstructArr[this.i].split(',');
              if(parameterTypeArr[this.i] == 'int' || parameterTypeArr[this.i] == 'float' || parameterTypeArr[this.i] == 'double') {
                var min = parameterBufferArray[0];
                var max = parameterBufferArray[1];
                if(parameterTypeArr[this.i] == 'int') {
                  value = parseInt(Math.random() * (max - min) + min);
                }
                else {
                  value = Math.random() * (max - min) + min;
                }
              }
              else if(parameterTypeArr[this.i] == 'string') {
                var max = parameterBufferArray.length - 1;
                value = parameterBufferArray[parseInt(Math.random() * (max - 0) + 0)];
              }
              else if(parameterTypeArr[this.i] == 'boolean') {
                var ref = Math.random() % 2;
                if (ref == 0) {
                  value = true;
                }
                else {
                  value = false;
                }
              }
              valueArray.push(value);
              sql = "INSERT INTO generated_parameters (assign_id, std_id, param_name, param_value) VALUES (?)";
              var values = [assignmentID,studentID,parameterNameArr[this.i],value];
              dbcon.query(sql, [values], function (err, result) {
                if (err) {
                  console.log(err);
                }
              });
            }
            else {
              valueArray.push(rows[0].param_value);
            }
          }
          if(this.i == parameterNameArr.length - 1) {
            //Writing the template to file to do generation
            fs.writeFileSync(process.cwd()+'/description.py.dna',descriptionString, 'utf8');

            //Executing generation with inputs
            console.log('Starting on generation')
            var pythonExec = require('python-shell');
            var argsList = ['description.py.dna'];
            for(var j = 0; j < valueArray.length; j++) {
              argsList.push(valueArray[j]);
            }
            var options = {
              args: argsList
            }
            console.log("Generation args: " + JSON.stringify(options));
            console.log('Generation args taken.');
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
        }.bind( {i: i} ));
      }
    }
  });
});

app.post('/io_gen', jsonParser, function (request, response) {
    console.log('Unique assignment i/o generation request received.')
    if(request.headers["nexus-access-token"] == accessToken) {
        console.log(`Request for generation to mark assignment ${request.body.aid},
        for student with id: ${request.body.sid}.`);

		var studentID = request.body.sid;
	    var assignmentID = request.body.aid;
		var inputs = request.body.inputs;
		var outputs = request.body.outputs;
		var feedback = request.body.feedback;
		var generatedInputs;
		var generatedOutputs;
		var generatedFeedback;

		//Fetching varialbes for particular assignment
		var sql = `SELECT param_name,param_type,param_construct FROM parameters WHERE assign_id = ${assignmentID};`;
		dbcon.query(sql, function (err, rows, result) {
		  if (err) {
			 console.log(err);
		  }
		  else {
			var parameterNameArr = new Array();
			var parameterTypeArr = new Array();
			var parameterConstructArr = new Array();

			for (var i in rows) {
				parameterNameArr.push(rows[i].param_name);
				parameterTypeArr.push(rows[i].param_type);
				parameterConstructArr.push(rows[i].param_construct);
			}

			//Appending variable-args assigning for generation commandline execution
			var appendingString = "";
			for(var i = 0; i < parameterNameArr.length; i++) {
				var index = i + 1;
				appendingString += parameterNameArr[i] + " = sys.argv[" + index.toString() + "];\n"
			}

			var inputString = appendingString;
			var outputString = appendingString;
			var feedbackString = appendingString;

			for (var i = 0; i < inputs.length; i++) {
				inputString += inputs[i] + "\n";
			}

			for (var i = 0; i < outputs.length; i++) {
				outputString += outputs[i] + "\n";
			}

			for (var i = 0; i < feedback.length; i++) {
				feedbackString += feedback[i] + "\n";
			}

			var valueArray = new Array();
			for (var i = 0; i < parameterNameArr.length; i++) {
				var sql = `SELECT param_value FROM generated_parameters WHERE assign_id = ${assignmentID} and std_id = ${studentID} and param_name = "${parameterNameArr[i]}"`;
				dbcon.query(sql, function (err, rows, result) {
				  if (err) {
					 console.log(err);
				  }
				  else {
					  if (rows.length == 0) {
							  var value;
							  var parameterBufferArray = parameterConstructArr[this.i].split(',');
							  if(parameterTypeArr[this.i] == 'int' || parameterTypeArr[this.i] == 'float' || parameterTypeArr[this.i] == 'double') {
								  var min = parameterBufferArray[0];
								  var max = parameterBufferArray[1];
								  if(parameterTypeArr[this.i] == 'int') {
									  value = parseInt(Math.random() * (max - min) + min);
								  }
								  else {
									value = Math.random() * (max - min) + min;
								  }
							  }
							  else if(parameterTypeArr[this.i] == 'string') {
								  var max = parameterBufferArray.length - 1;
								  value = parameterBufferArray[parseInt(Math.random() * (max - 0) + 0)];
							  }
							  else if(parameterTypeArr[this.i] == 'boolean') {
								  var ref = Math.random() % 2;
								  if (ref == 0) {
									  value = true;
								  }
								  else {
									  value = false;
								  }
							  }
							  valueArray.push(value);
							  sql = "INSERT INTO generated_parameters (assign_id, std_id, param_name, param_value) VALUES (?)";
							  var values = [assignmentID,studentID,parameterNameArr[this.i],value];
							  dbcon.query(sql, [values], function (err, result) {
								if (err) {
								   console.log(err);
								}
							  });
					  }
					  else {
						  valueArray.push(rows[0].param_value);
					  }
					  if(this.i == parameterNameArr.length - 1) {
						  async.waterfall([
							function(callback) {
								//Writing the inputs to file to do generation
								fs.writeFileSync(process.cwd()+'/iogen.py.dna',inputString, 'utf8');

								//Executing generation with inputs
								console.log('Starting on generation')
								var pythonExec = require('python-shell');
								var argsList = ['iogen.py.dna'];
								for(var i = 0; i < valueArray.length; i++) {
								  argsList.push(valueArray[i]);
								}
								var options = {
								  args: argsList
								}
								console.log("Generation args list 1: " + JSON.stringify(options));
								console.log('Generation args taken.');
								pythonExec.run('/ribosome.py', options, function (err, results) {
									if (err) {
										console.log(err);
										response.send(null);
										callback(err, null);
									}
									else {
									  console.log('results: %j', results);
									  generatedInputs = results;
									  callback(null, results);
								   }
								});
							},
							function(arg1, callback) {
								//Writing the outputs to file to do generation
								fs.writeFileSync(process.cwd()+'/iogen.py.dna',outputString, 'utf8');

								//Executing generation with inputs
								console.log('Starting on generation')
								var pythonExec = require('python-shell');
								var argsList = ['iogen.py.dna'];
								for(var i = 0; i < valueArray.length; i++) {
								  argsList.push(valueArray[i]);
								}
								var options = {
								  args: argsList
								}
								console.log("Generation args list 2: " + JSON.stringify(options));
								console.log('Generation args taken.');
								pythonExec.run('/ribosome.py', options, function (err, results) {
									if (err) {
										console.log(err);
										response.send(null);
										callback(err, null);
									}
									else {
									  console.log('results: %j', results);
									  generatedOutputs = results;
									  callback(null, results);
								   }
								});
							},
							function(arg1, callback) {
								//Writing the outputs to file to do generation
								fs.writeFileSync(process.cwd()+'/iogen.py.dna',feedbackString, 'utf8');

								//Executing generation with inputs
								console.log('Starting on generation')
								var pythonExec = require('python-shell');
								var argsList = ['iogen.py.dna'];
								for(var i = 0; i < valueArray.length; i++) {
								  argsList.push(valueArray[i]);
								}
								var options = {
								  args: argsList
								}
								console.log("Generation args list 3: " + JSON.stringify(options));
								console.log('Generation args taken.');
								pythonExec.run('/ribosome.py', options, function (err, results) {
									if (err) {
										console.log(err);
										response.send(null);
										callback(err, null);
									}
									else {
									  console.log('results: %j', results);
									  generatedFeedback = results;
									  callback(null, results);
								   }
								});
							},
							function(arg1, callback) {
								console.log('Sent the generated i/o: ' + generatedInputs + " " + generatedOutputs + " " + generatedFeedback);
								response.json({
									generatedInputs: generatedInputs,
									generatedOutputs: generatedOutputs,
									generatedFeedback: generatedFeedback
								});
								callback(null, 'Success');
							}
						], function (err, result) {
							console.log("Result of generation for i/o test with assignment with id: " + request.body.aid
										+ ", wtih student id: " + request.body.sid + " is: " + result)
							console.log("Errors from generation for i/o test with assignment with id: " + request.body.aid
										+ ", wtih student id: " + request.body.sid + " is: " + err);
						});
					  }
				  }
				}.bind( {i: i} ));
			}
		  }
		});
    }
    else {
      console.log('Token error. The token:');
      console.log(request.headers["nexus-access-token"])
      response.send('Invalid token!');
    }
});

app.listen(port, function () {
    console.log('UAT listening on port: ' + port);
});
