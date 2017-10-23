import { mysql, dbcon } from './db_mgr';
import async from 'async';
import forEachOf from 'async/eachOf';

var childProcess = require('child_process');
var fs = require('fs');
var cors = require('cors');
var wait = require('wait.for');

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
      response.status(500).send(`Error from unique-assignment service: ${err}.`);
    }
    else {
      process_variables(response, rows, studentID, assignmentID, descriptionString);
    }
  });
}

function process_variables (response, rows, studentID, assignmentID, descriptionString) {
  // Start by figuring out values for each variable for this student
  console.log("Getting variables and their values.");
  var valueArray = {};
  async.forEachOf(rows,
    (row, index, cb) => {
      getParameterValueForStudent(valueArray, studentID, assignmentID, row.param_name, row.param_type, row.param_construct, cb);
    },
    (err) => {
      if (err) {
        response.status(500).send(`Error from unique-assignment service: ${err}.`);
      }
      else {
        // valueArray now is a hash from param names to their values
        var varInits = "";
        for(var varName in valueArray){
          // FIXME: Need to consider whether the variable is a string, in which case it may need quote marks. Probably actually best done when we put the value into the hash.
          varInits += `${varName} = ${valueArray[varName]};\n`;
        }
        descriptionString = varInits + descriptionString;
        console.log(`Prepared runnable template: "${descriptionString}".`);

        //Writing the template to file to do generation
        console.log("Generating template invocation");
        fs.writeFileSync(process.cwd()+'/description.py.dna',descriptionString, 'utf8');

        //Executing generation with inputs
        console.log('Starting on generation')
        var pythonExec = require('python-shell');
        var argsList = ['description.py.dna'];
        /*for(var j = 0; j < valueArray.length; j++) {
          argsList.push(valueArray[j]);
        }*/
        var options = {
          args: argsList
        }
        console.log("Generation args: " + JSON.stringify(options));
        console.log('Generation args taken.');
        pythonExec.run('/ribosome.py', options, function (err, results) {
          if (err) {
            console.log(err);
            response.status(500).send(`Error from unique-assignment service: ${err}.`);
          }
          else {
            console.log('results: %j', results);
            console.log(`Sent description for assignment with id: ${assignmentID}, for student with id: ${studentID}`);
            response.send(results.join("\n"));
          }
        });
      }
    }
  );
}

function getParameterValueForStudent(valueArray, studentID, assignmentID, paramName, paramType, paramConstruct, callback) {
  console.log (`Finding value for parameter ${paramName} : ${paramType}[${paramConstruct}].`);

  console.log(`Starting with db lookup.`);
  var sql = `SELECT param_value FROM generated_parameters WHERE assign_id = ${assignmentID} and std_id = ${studentID} and param_name = "${paramName}"`;
  dbcon.query(sql, function (err, rows, result) {
    if (err) {
      console.log(err);
      callback(err);
      return;
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
            valueArray[paramName] = parseInt(Math.random() * (max - min) + min);
          }
          else {
            valueArray[paramName] = Math.random() * (max - min) + min;
          }
        }
        else if(paramType == 'string') {
          console.log("Found string type");
          var max = parameterBufferArray.length - 1;
          valueArray[paramName] = parameterBufferArray[parseInt(Math.random() * (max - 0) + 0)];
        }
        else if(paramType == 'boolean') {
          console.log ("Found boolean type.");
          var ref = Math.random() % 2;
          if (ref == 0) {
            valueArray[paramName] = true;
          }
          else {
            valueArray[paramName] = false;
          }
        }

        console.log (`Pushing new value ${valueArray[paramName]} into database.`);
        sql = "INSERT INTO generated_parameters (assign_id, std_id, param_name, param_value) VALUES (?)";
        var values = [assignmentID,studentID,paramName,valueArray[paramName]];
        dbcon.query(sql, [values], function (err, result) {
          if (err) {
            console.log(err);
            callback(err);
            valueArray[paramName] = null;
          } else {
            callback();
          }
        });
      }
      else {
        valueArray[paramName] = rows[0].param_value;
        callback();
      }
    }
  });
}
