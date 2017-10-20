import { mysql, dbcon } from './db_mgr';

var childProcess = require('child_process');
var fs = require('fs');
var cors = require('cors');
var wait = require('wait.for');
var async = require('async');

export function desc_gen_handler (request, response) {
  var studentID = request.body.studentid;
	var assignmentID = request.body.aid;
	var descriptionString = request.body.description_string;

  console.log(`Request for generating description for assignment with id: ${assignmentID}, for student with id: ${studentID}`);

  //Fetching variables for particular assignment
  console.log("Fetching variables from database");
	var sql = `SELECT param_name,param_type,param_construct FROM parameters WHERE assign_id = ${assignmentID};`;
	dbcon.query(sql, (err, rows, result) => {
    if (err) {
      console.log(`Couldn't read variables from database for assignment ${assignmentID}: ${err}.`);
      response.status(500).send(`Error from unique-assignment service: ${err}`);
    }
    else {
      process_variables(response, rows, studentID, assignmentID, descriptionString);
    }
  });
}

// FIXME: The below isn't quite correct as the various db lookups are actually happening asynchronously and, therefore, there's a bit of confusion about generating actual values.
function process_variables (response, rows, studentID, assignmentID, descriptionString) {
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
  console.log(`Prepared runnable template: "${descriptionString}".`);

  console.log("Now setting variable values.");
  var valueArray = new Array();
  for (var i = 0; i < parameterNameArr.length; i++) {
    valueArray.push(getParameterValueForStudent(studentID, assignmentID, parameterNameArr[i], parameterTypeArr[i], parameterConstructArr[i]));
  }

  //Writing the template to file to do generation
  console.log("Generating template invocation");
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
      console.log(`Sent description for assignment with id: ${assignmentID}, for student with id: ${studentID}`);
      response.send(results[0]);
    }
  });
}

function getParameterValueForStudent(studentID, assignmentID, paramName, paramType, paramConstruct) {
  console.log (`Finding value for parameter ${paramName} : ${paramType}[${paramConstruct}].`);

  console.log(`Starting with db lookup.`);
  var sql = `SELECT param_value FROM generated_parameters WHERE assign_id = ${assignmentID} and std_id = ${studentID} and param_name = "${paramName}"`;
  var value = null;
  dbcon.query(sql, function (err, rows, result) {
    if (err) {
      console.log(err);
    }
    else {
      if (rows.length == 0) {
        console.log(`No value in database for parameter ${paramName} : ${paramType}[${paramConstruct}]. Creating new value.`);

        var parameterBufferArray = paramConstruct.split(',');
        if(paramType == 'int' || paramType == 'float' || paramType == 'double') {
          console.log("Found numerical type.");
          var min = parameterBufferArray[0];
          var max = parameterBufferArray[1];
          if(paramType == 'int') {
            value = parseInt(Math.random() * (max - min) + min);
          }
          else {
            value = Math.random() * (max - min) + min;
          }
        }
        else if(paramType == 'string') {
          console.log("Found string type");
          var max = parameterBufferArray.length - 1;
          value = parameterBufferArray[parseInt(Math.random() * (max - 0) + 0)];
        }
        else if(paramType == 'boolean') {
          console.log ("Found boolean type.");
          var ref = Math.random() % 2;
          if (ref == 0) {
            value = true;
          }
          else {
            value = false;
          }
        }

        console.log (`Pushing new value ${value} into database.`);
        sql = "INSERT INTO generated_parameters (assign_id, std_id, param_name, param_value) VALUES (?)";
        var values = [assignmentID,studentID,paramName,value];
        dbcon.query(sql, [values], function (err, result) {
          if (err) {
            console.log(err);
            value = null;
          }
        });
      }
      else {
        value = rows[0].param_value;
      }
    }
  });

  return value;
}
