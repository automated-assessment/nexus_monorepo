import async from 'async';
import forEachOf from 'async/eachOf';
import series from 'async/series';

const fs = require('fs-extra');
const pythonExec = require('python-shell');

const accessToken = process.env.UAT_ACCESS_TOKEN;
if (!process.env.UAT_ACCESS_TOKEN) {
  console.log('Error: Specify UAT_ACCESS_TOKEN in environment');
  process.exit(1);
}

var mysql = require('mysql');

var dbConnectionPool  = mysql.createPool({
  connectionLimit : 10,
  host: process.env.MYSQL_HOST || "mysql",
  port: 3306,
  user: process.env.MYSQL_USER || "uat-tool",
  password: process.env.MYSQL_PASSWORD || "uat-pass",
  database: process.env.MYSQL_DATABASE || "uat"
});

dbConnectionPool.on('acquire', function (connection) {
  console.log('Connection %d acquired', connection.threadId);
});

dbConnectionPool.on('connection', function (connection) {
  connection.on('error', function(err) {
    console.log(`Connection-level error occurred: ${err.code}.`);
    if (err.fatal) {
      // Cleanup is already handled by DB pool
      console.log("This was a fatal error.");
    }
  });
});

dbConnectionPool.on('enqueue', function () {
  console.log('Waiting for available connection slot');
});

dbConnectionPool.on('release', function (connection) {
  console.log('Connection %d released', connection.threadId);
});

/**
 * Retrieve the parameters defined for the given assignment.
 *
 * Expects the following JSON body:
 *
 * {assignment: num}
 *
 * Returns a JSON of this form:
 *
 * {parameters: [{name: string, type: int, construct: string}]}
 *
 */
export function get_params_handler (request, response) {
  var assignment = request.body.assignment;
  console.log (`Provided with parameters for assignment ${assignment}: ${parameters}.`);

  var parameters = [];

  async.series([
      (cb) => {
        getParametersFor (parameters, assignment, cb);
      }
    ],
    (err, res) => {
      if (err) {
        console.log(`Error fetching parameters: ${err}.`);
        response.status(500).send(`Error from unique-assignment service: ${err}.`);
      } else {
        console.log("Successfully fetched parameters.");
        response.status(200).send(
          JSON.stringify({
            parameters: parameters.map(
              (p) => {
                return {
                  name: p.param_name,
                  type: p.param_type,
                  construct: p.param_construct};
                }
              )
            }
          )
        );
      }
    });
}

/**
 * Receives parameter set for a given assignment and stores them in the database.
 *
 * Expects the following JSON body:
 *
 * {assignment: num,
 *  parameters: [{type: int, name: string, construct: string}]}
 */
export function update_assignment_parameters_handler (request, response) {
  var assignment = request.body.assignment;
  var parameters = request.body.parameters;
  console.log (`Provided with parameters for assignment ${assignment}: ${parameters}.`);

  async.series([
      ensure_tables_initialised,
      (cb) => {
        do_delete_assignment_data (assignment, cb);
      },
      (cb) => {
        do_update_assignment_parameters (assignment, parameters, cb);
      }
    ],
    (err, res) => {
      if (err) {
        console.log(`Error updating parameters: ${err}.`);
        response.status(500).send(`Error from unique-assignment service: ${err}.`);
      } else {
        console.log("Successfully updated parameters.");
        response.status(200).send("Success");
      }
    });
}

/**
 * Removes the given assignment from the database.
 *
 * Expects the following JSON body:
 *
 * {assignment: num}
 */
export function remove_assignment_handler (request, response) {
  var assignment = request.body.assignment;
  console.log(`Removing assignment ${assignment}.`);

  async.series([
      (cb) => {
        do_delete_assignment_data (assignment, cb);
      }
    ],
    (err, result) => {
      if (err) {
        console.log(`Error deleting assignment: ${err}.`);
        response.status(500).send(`Error from unique-assignment service: ${err}.`);
      } else {
        console.log(`Successfully deleted assignment ${assignment}.`);
        response.status(200).send("Success");
      }
    }
  );
}

/**
 * Handle tool generation request. Expects access token to be included in request.
 */
export function grader_gen_handler (request, response) {
  console.log('Unique assignment i/o generation request received.')
  if(request.headers["nexus-access-token"] == accessToken) {
    var studentID = request.body.sid;
    var assignmentID = request.body.aid;
    var templates = request.body.templates;

    console.log(`Request for generation to mark assignment ${assignmentID}, for student with id: ${studentID}.`);
    // FIXME: This requires changes to io-tool's processing of the data returned
    do_generate(response, studentID, assignmentID, templates);
  }
  else {
    console.log(`Token error. The token: ${request.headers["nexus-access-token"]}.`);
    response.status(500).send('Invalid token!');
  }
}

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

function ensure_tables_initialised (cb) {
  var sql =
    "CREATE TABLE parameters (param_id INT AUTO_INCREMENT, param_name VARCHAR(50), " +
    "param_type ENUM ('int','float','double','string','boolean'), param_construct TEXT, assign_id INT, "+
    "PRIMARY KEY (param_id)) ENGINE=INNODB;";

  dbConnectionPool.query(sql, (err, result) => {
    if (err && err.code !== "ER_TABLE_EXISTS_ERROR") {
      cb(err);
      return;
    } else {
      console.log("Ensured presence of parameters table.");

      var sql =
        "CREATE TABLE generated_parameters (assign_id INT, std_id INT, param_name VARCHAR(50), param_value TEXT) ENGINE=INNODB;";
        dbConnectionPool.query(sql, (err, result) => {
          if (err && err.code !== "ER_TABLE_EXISTS_ERROR") {
            cb(err);
            return;
          } else {
            console.log("Ensured presence of generated_parameters table.");
            cb();
          }
        });
    }
  });
}

function do_delete_assignment_data (assignment, cb) {
  var sql = "DELETE FROM parameters WHERE assign_id=?";
  dbConnectionPool.query(sql, [assignment], (err, result) => {
    if (err) {
      console.log(`Failed to delete original parameters for assingment ${assignment}: ${err}`);
      cb(err);
    } else {
      var sql = "DELETE FROM generated_parameters WHERE assign_id=?";
      dbConnectionPool.query(sql, [assignment], (err, result) => {
        if (err) {
          console.log(`Failed to delete original generated parameters for assingment ${assignment}: ${err}`);
          cb(err);
        } else {
          cb();
        }
      });
    }
  });
}

function do_update_assignment_parameters (assignment, parameters, cb) {
  var sql = "INSERT INTO parameters (param_name,param_type,param_construct,assign_id) VALUES (?)";
  async.forEach (parameters,
    (p, cb2) => {
      var values = [p.name, p.type, p.construct, assignment];
  		dbConnectionPool.query(sql, [values], (err, result) => {
        if (err) {
          console.log(`Failed to add parameter ${p.name} to database for assignment ${assignment}: ${err}.`);
          cb2(err);
        } else {
          cb2();
        }
      });
    },
    (err) => {
      cb(err);
    }
  );
}

/**
 * Generate code from each of the templates, using the variable values for the
 * given student and assignment.
 */
function do_generate (response, studentID, assignmentID, templates) {
  // Array storing the parameter data from the database
  var parameters = [];
  // Hash storing the variables and their values
  var variableValues = {};
  // Collection for storing the results, one per template. Either a map (object) or an array depending on what inputs we received.
  var results = {};
  if (Array.isArray(templates)) {
    results = new Array();
  }
  async.series([
    (cb) => {
      getParametersFor (parameters, assignmentID, cb);
    },
    (cb) => {
      // Get variable values
      getVariableValuesFor (variableValues, parameters, studentID, assignmentID, cb);
    },
    (cb) => {
      // Generate from each template -- this can handle both maps and arrays
      async.forEachOf (templates,
        (template, index, cb2) => {
          do_generate_one (results, template, assignmentID, studentID, index, variableValues, cb2);
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
function getVariableValuesFor (variableValues, parameters, studentID, assignmentID, cb) {
  console.log(`Getting variable values for student ${studentID}.`);
  async.forEachOf(parameters,
    (row, index, cb) => {
      getParameterValueForStudent(variableValues, studentID, assignmentID, row.param_name, row.param_type, row.param_construct, cb);
    },
    (err) => { cb(err); });
}

function getParametersFor (parameters, assignmentID, cb) {
  //Fetch  variable definitions for particular assignment
  console.log(`Fetching variable definitions for ${assignmentID} from database.`);

	var sql = "SELECT param_name,param_type,param_construct FROM parameters WHERE assign_id=?";
	dbConnectionPool.query(sql, [assignmentID], (err, rows, result) => {
    if (err) {
      cb(err);
    } else {
      Array.prototype.push.apply(parameters, rows);
      cb();
    }
  });
}

function removeDirectoryIfExists (dir) {
  if (dir !== '') {
    if (fs.existsSync(dir)) {
      fs.removeSync(dir);
      console.log(`Cleaned up directory ${dir}.`);
    }
  }
}

/**
 * Generate from the given template and store the result in gen_results at index
 * index.
 */
function do_generate_one (gen_results, template, assignment, student, index, valueArray, cb) {
  var varInits = "";
  for(var varName in valueArray){
    // FIXME: Need to consider whether the variable is a string, in which case it may need quote marks. Probably actually best done when we put the value into the hash.
    varInits += `${varName} = ${valueArray[varName]};\n`;
  }
  template = varInits + template;
  console.log(`Prepared runnable template: "${template}".`);

  //Writing the template to file to do generation
  console.log("Generating template invocation");
  var templatePath = process.cwd() + `templates/${assignment}/${student}/${index}/`;
  removeDirectoryIfExists(templatePath);
  fs.ensureDir(templatePath, (err) => {
    if (err) {
      cb(err);
      return;
    }

    var dnaFileName = `${templatePath}template.py.dna`;
    fs.writeFile(dnaFileName, template, 'utf8', (err) => {
      if (err) {
        cb(err);
        return;
      }

      //Executing generation with inputs
      console.log('Starting on generation')
      var argsList = [dnaFileName];
      /*for(var j = 0; j < valueArray.length; j++) {
        argsList.push(valueArray[j]);
      }*/
      var options = {
        args: argsList
      }
      console.log("Generation args: " + JSON.stringify(options));
      console.log('Generation args taken.');
      pythonExec.run('/ribosome.py', options, (err, results) => {
        fs.remove(templatePath, (err2) => {
          if (err) {
            console.log(`Issue running python ribosome: ${err.stack}`);
            cb(err);
            return;
          }

          if (err2) {
            cb(err2);
            return;
          }

          console.log('results: %j', results);
          gen_results[index] = results.join('\n');
          cb();
        });
      });
    });
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

  console.log("Starting with db lookup.");
  var sql = "SELECT param_value FROM generated_parameters WHERE assign_id=? and std_id=? and param_name=?";
  var values = [assignmentID, studentID, paramName];
  dbConnectionPool.query(sql, values, function (err, rows, result) {
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
          valueArray[paramName] = `"${parameterBufferArray[parseInt(Math.random() * (max - 0) + 0)]}"`;
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
        dbConnectionPool.query(sql, [values], function (err, result) {
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
