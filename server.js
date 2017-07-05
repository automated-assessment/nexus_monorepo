var express = require('express');
var sleeper = require('sleep');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var childProcess = require('child_process');
var fs = require('fs');
var mysql = require('mysql');
var cors = require('cors');
var wait = require('wait.for');

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
  host: "mysql",
  port: 3306,
  user: "uat-tool",
  password: "uat-pass",
  database: "uat"
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
			"param_type ENUM ('boolean','int','float','double','string'), assign_id INT, PRIMARY KEY (para" + 
			"m_id), FOREIGN KEY (assign_id) REFERENCES assignments(assign_id)) ENGINE=INNODB;";
	  dbcon.query(sql, function (err, result) {
	  if (err && err.code !== "ER_TABLE_EXISTS_ERROR") {
		 console.log(err);
	  }
	  else {
		  console.log("Table Parameters is created for the database.");
		  paramString = request.body.parameter_string;
		  console.log(paramString);
	   }
	});
   }
 });
}

function paramUploadFinishHandler (request, response) {
  var assignmentID = request.body.aid;
  var parameterPairs = paramString.split([',']);
  var parameterNameArr = new Array();
  var parameterTypeArr = new Array();
  paramString = "";

  for(var i = 0; i < parameterPairs.length; i++) {
	parameterNameArr[i] = parameterPairs[i].split(':')[0];
	parameterTypeArr[i] = parameterPairs[i].split(':')[1];
  }

  var sql = "INSERT INTO assignments VALUES (?)";
  var values = [assignmentID];
  dbcon.query(sql, [values], function (err, result) {
	if (err) {
	   console.log(err);
	}
	else {
	  for(var i = 0; i < parameterPairs.length; i++) {
		sql = "INSERT INTO parameters (param_name,param_type,assign_id) VALUES (?)";
		var values = [parameterNameArr[i],parameterTypeArr[i],assignmentID];
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
    console.log('Unique assignment desscription generation request received.');
	console.log(`Request for generating description for assignment with id: ${request.body.aid}, for student with id: ${request.body.studentid}`);
	
	var studentID = request.body.studentid;
	var assignmentID = request.body.aid;
	var descriptionString = request.body.description_string;
	
	var sql = `SELECT param_name,param_type FROM parameters WHERE assign_id = ${assignmentID};`;
	dbcon.query(sql, function (err, rows, result) {
	  if (err) {
	     console.log(err);
  	  }
	  else {
	  	var parameterNameArr = new Array();
		var parameterTypeArr = new Array();


		for (var i in rows) {
			parameterNameArr.push(rows[i].param_name);
			parameterTypeArr.push(rows[i].param_type);
		}  

		//Appending variable-args assigning for generation commandline execution
		var appendingString = "";
		for(var i = 0; i < parameterNameArr.length; i++) {
			var index = i + 1;
			appendingString += parameterNameArr[i] + " = sys.argv[" + index.toString() + "];\n" 
		}
		descriptionString = appendingString + descriptionString;

		//TODO Aydin: Solely for initial generation functionality. Values will be generated in later stages
		var valueArray = new Array();
		valueArray.push(new Array());
		valueArray.push(new Array());
		valueArray.push(new Array());
		valueArray[1] = fs.readFileSync(process.cwd()+'/1', "utf8").toString().split("\n");
		valueArray[2] = fs.readFileSync(process.cwd()+'/2', "utf8").toString().split("\n");

		//Writing the template to file to do generation
		fs.writeFileSync(process.cwd()+'/description.py.dna',descriptionString, 'utf8'); 
		//Executing generation with inputs
		console.log('Starting on generation')
		var pythonExec = require('python-shell');

		var argsList = ['description.py.dna'];
		for(var i = 0; i < valueArray[studentID].length; i++) {
		  argsList.push(valueArray[studentID][i]);
		}

		var options = {
		  args: argsList			  
		}  

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
    });
});

app.post('/io_gen', jsonParser, function (request, response) {
    console.log('Unique assignment file generation request received.')
    if(request.headers["nexus-access-token"] == accessToken) { 
        console.log(`Request for fetching files to mark assignment ${request.body.aid}, 
        submission id: ${request.body.sid},
        for student with id: ${request.body.studentuid},
        request from ${request.body.toolname}.`);
		
		var studentID = request.body.sid;
	    var assignmentID = request.body.aid;
		
		var sql = `SELECT param_name,param_type FROM parameters WHERE assign_id = ${assignmentID};`;
		dbcon.query(sql, function (err, rows, result) {
		  if (err) {
			 console.log(err);
		  }
		  else {
			var parameterNameArr = new Array();
			var parameterTypeArr = new Array();


			for (var i in rows) {
				parameterNameArr.push(rows[i].param_name);
				parameterTypeArr.push(rows[i].param_type);
			}  

			//do generation based on io-tool  
			  
			console.log('Sent Hello World, ish...');
			response.send('Unique generation is still under construction.');
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