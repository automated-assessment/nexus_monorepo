import { mysql, dbcon } from './db_mgr';
import async from 'async';
import forEachOf from 'async/eachOf';
import series from 'async/series';

var fs = require('fs');

/**
 * Handle generation of a description for an assignment.
 */
export function desc_gen_handler (request, response) {
  var studentID = request.body.studentid;
	var assignmentID = request.body.aid;
	var descriptionString = request.body.description_string;

  console.log(`Request for generating description for assignment with id: ${assignmentID}, for student with id: ${studentID}`);
  do_generate(response, studentID, assignmentID, [descriptionString]);
}

/**
 * Generate code from each of the templates, using the variable values for the
 * given student and assignment.
 */
function do_generate (response, studentID, assignmentID, templates) {
  // Hash storing the variables and their values
  var variableValues = {};
  // Array storing the results, one per template
  var results = new Array();
  async.series([
    (cb) => {
      // Get variable values
      getVariableValuesFor (variableValues, studentID, assignmentID, cb);
    },
    (cb) => {
      // Generate from each template
      async.forEachOf (templates,
        (template, index, cb2) => {
          do_generate_one (results, template, index, variableValues, cb2);
        },
        (err) => {
          cb(err);
        }
      );
    }
  ],
  (err, res) => {
    if (err) {
      console.log(`Error generating: ${err}.`);
      response.status(500).send(`Error from unique-assignment service: ${err}.`);
    } else {
      console.log("About to send generation results back to Nexus: %j.", results);
      response.status(200).send(JSON.stringify({generated: results}));
    }
  });
}

/**
 * Get the values for all variables for the given assignment and student,
 * either from the database or by generating them for the first time and store
 * them in variableValues.
 */
function getVariableValuesFor (variableValues, studentID, assignmentID, cb) {
  //Fetch  variable definitions for particular assignment
  console.log(`Fetching variable definitions for ${assignmentID} from database.`);

  // FIXME: SQL Injection
	var sql = `SELECT param_name,param_type,param_construct FROM parameters WHERE assign_id = ${assignmentID};`;
	dbcon.query(sql, (err, rows, result) => {
    if (err) {
      cb(err);
    } else {
      console.log(`Getting variable values for student ${studentID}.`);
      async.forEachOf(rows,
        (row, index, cb) => {
          getParameterValueForStudent(variableValues, studentID, assignmentID, row.param_name, row.param_type, row.param_construct, cb);
        },
        (err) => { cb(err); });
    }
  });
}

/**
 * Generate from the given template and store the result in gen_results at index
 * index.
 */
function do_generate_one (gen_results, template, index, valueArray, cb) {
  var varInits = "";
  for(var varName in valueArray){
    // FIXME: Need to consider whether the variable is a string, in which case it may need quote marks. Probably actually best done when we put the value into the hash.
    varInits += `${varName} = ${valueArray[varName]};\n`;
  }
  template = varInits + template;
  console.log(`Prepared runnable template: "${template}".`);

  //Writing the template to file to do generation
  console.log("Generating template invocation");
  // FIXME: Generate to separate directories / files to avoid overwriting when handling multiple requests in parallel
  fs.writeFileSync(process.cwd()+'/template.py.dna', template, 'utf8');

  //Executing generation with inputs
  console.log('Starting on generation')
  // TODO: Move this to imports on the top
  var pythonExec = require('python-shell');
  var argsList = ['template.py.dna'];
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
      cb(err);
    }
    else {
      console.log('results: %j', results);
      gen_results[index] = results.join("\n");
      cb();
    }
  });
}

/**
 * Get the value of parameter paramName of type paramType (with initialisation
 * paramConstruct) for the given student and assignment. Store it in hash
 * valueArray under the key paramName. Call callback when done or when an error
 * has occurred.
 */
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
