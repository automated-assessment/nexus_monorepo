import async from 'async';
import tmp from 'tmp';
import { exec } from 'child_process';
import yaml from 'node-yaml';
import fs from 'fs';
import klaw from 'klaw';
import userid from 'userid';
import glob from 'glob'

const configSchema = yaml.readSync ('config_schema.yml', {schema: yaml.schema.defaultSafe});

const cmd = process.env.TOOL_CMD ? process.env.TOOL_CMD : '/usr/src/app/grade_submission.sh';

export function doMarkSubmission(aid, studentuid, submissionID, sourceDir, config, is_unique, cb) {
  console.log(`About to run marking tool for submission ${submissionID}.`);

  tmp.file({ prefix: 'results-', postfix: '.html', discardDescriptor: true },
    (err, path, fd, cleanupCallback) => {
      if (err) {
        cb(err);
        return;
      }

      async.series({
          chownSourceDir: (cb) => { makeAppOwned(sourceDir, cb); },
          chownResultsFile: (cb) => { makeAppOwned(path, cb); },
          mark: (cb) => { _doMarkSubmission(aid, studentuid, submissionID, sourceDir, config, path, is_unique, cleanupCallback, cb); }
        },
        (err, res) => {
          if (res.mark) {
            cb(err, res.mark.mark, res.mark.feedback);
          } else {
            cb(err, -1, 'Internal error');
          }
        });
    });
}

function _doMarkSubmission(aid, studentuid, submissionID, sourceDir, config, path, is_unique, cleanupCallback, cb) {
  console.log(`Processing marking of submission ${submissionID} using file ${path} for communication.`);

  // Call cmd and transfer relevant information.
  processConfig(config, aid, studentuid, is_unique, (err, env, cleanup) => {
    if (err) {
      cleanup();
      cleanupCallback();
      cb(err);
      return;
    }

    exec(`gosu app ${cmd} ${path}`, { cwd: sourceDir, env: env },
      (error, stdout, stderr) => {
        let mark = 0;
        let feedback = '';

        console.log(`Marking tool output:\n${stdout}\n${stderr}`);

        if (error) {
          if ((error.code >= 0) && (error.code <= 100)) {
            console.log(`Marking tool produced mark for submission ${submissionID}: ${error.code}.`);
            mark = error.code;
            fs.readFile(path, 'utf8', (err, data) => {
              cleanupCallback();
              cb(err, {mark: mark, feedback: data});
            });
            cleanup();
            return;
          } else {
            console.log(`Internal error running marking tool for submission ${submissionID}: ${error}.`);
            mark = -1;
            feedback = 'Internal error: testing tool failed to run command.';
          }
        } else {
          console.log(`Marking tool ran successfully for submission ${submissionID}. Reporting mark of 0 and feedback produced.`);
          fs.readFile(path, 'utf8', (err, data) => {
            cleanupCallback();
            cb(err, {mark: mark, feedback: data});
          });
          cleanup();
          return;
        }

        cleanup();
        cleanupCallback();
        cb(null, {mark: mark, feedback: feedback});
      });
  });
}

function processConfig(config, aid, studentuid, is_unique, cb) {
  if (!config) {
    cb(null, {'NEXUS_ACCESS_TOKEN':''}, () => {});
  } else {
    async.mapSeries(Object.keys(config),
      (param, cb) => {
        if (configSchema.parameters[param].type == "git") {
          tmp.dir({ prefix: 'helperfiles-', postfix: '.' + param, unsafeCleanup: true },
            (err, path, cleanupCallback) => {
              if (err) {
                cb(err, { env: {}, cleanup: () => {} });
                return;
              }

              console.log('Checking out ' + param + ' into ' + path);

              async.series([
                  (cb) => {
                    cloneFiles(config[param].repository, config[param].branch, path, cb);
                  },
                  (cb) => {
                    checkoutFiles(config[param].sha, path, cb);
                  },
                  (cb) => {
                    if ((is_unique) && (configSchema.parameters[param].uniquify)) {
                      uniquifyFilesIfNeeded(aid, studentuid, path, configSchema.parameters[param].uniquify, cb);
                    } else {
                      cb();
                    }
                  },
                  (cb) => {
                    makeAppOwned(path, cb);
                  }
                ],
                (err, res) => {
                  if (err) {
                    if (fs.existsSync(path)) {
                      cb(err, { env: {}, cleanup: cleanupCallback });
                    } else {
                      cb(err, { env: {}, cleanup: () => {} });
                    }
                  } else {
                    var env = {};
                    env[param] = path;
                    cb(null, { env: env, cleanup: cleanupCallback });
                  }
                });
            });
        } else {
          var env = {};
          env[param] = config[param];
          cb(null, { env: env, cleanup: () => {} });
        }
      },
      (err, result) => {
        cb(err,
          result.reduce((acc, val) => { return Object.assign(acc, val.env); }, {'NEXUS_ACCESS_TOKEN':''}),
          () => {
            result.forEach((val) => { val.cleanup(); });
          });
      }
    );
  }
}

function makeAppOwned(dir, cb) {
  let uid = userid.uid('app');
  let gid = userid.gid('app');
  fs.chown(dir, uid, gid, (err) => {
    if (err) {
      cb(err);
    } else {
      klaw(dir)
        .on('data', (item) => { fs.chownSync(item.path, uid, gid); })
        .on('end', cb);
    }
  });
}

/**
 * Find all files in path that match any of the glob patterns in uniquify and
 * replace them by what the unique assignment tool reports for them.
 */
function uniquifyFilesIfNeeded(aid, studentuid, path, uniquify, cb) {
  // Find all file names that match the uniquify glob pattern.
  glob(uniquify, {cwd: path, root: path, nodir: true, absolute: true}, (err, fileNames) => {
    if (err) {
      cb(err);
      return;
    }

    let fileData = {};

    async.each(fileNames,
      (fileName, cb) => {
        // Load file and store contents in map under file name
        fs.readFile(fileName, (err, data) => {
          if (err) {
            cb(err);
            return;
          }

          fileData[fileName] = data;
          cb();
        });
      },
      (err) => {
        // Call UAT and replace file contents with generation result
        if (err) {
          cb(err);
          return;
        }

        // Call UAT
        // UAT now works off of the map directly, so we can just send our map across
        sendUniquificationRequest(aid, studentuid, fileData, (err, res, body) => {
          if (err) {
            cb(err);
            return;
          }

          // Get stuff back from UAT and write out to those files.
          async.each(fileNames,
            (fileName, cb) => {
              // Write new contents of this file
              fs.writeFile(fileName, body.generated[fileName], cb);
            },
            (err) => {
              cb(err);
            }
          );
        });
      });
  });
}

// TODO: DRY up
function cloneFiles(cloneURL, branch, dir, cb) {
  console.log(`Cloning into directory ${dir}.`);

  // clone repo
  exec(`git clone --branch ${branch} --single-branch ${cloneURL} ${dir}`,
    (error, stdout, stderr) => {
      cb(error);
    }
  );
}

// TODO: DRY up
function checkoutFiles(sha, dir, cb) {
  exec(`git checkout ${sha}`, { cwd: dir },
    (error, stdout, stderr) => {
      cb(error);
    }
  );
}
