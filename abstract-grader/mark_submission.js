import tmp from 'tmp';
import { exec } from 'child_process';
import fs from 'fs';

const cmd = process.env.TOOL_CMD ? process.env.TOOL_CMD : '/usr/src/app/grade_submission.sh';

export function doMarkSubmission(submissionID, sourceDir, config, cb) {
  console.log(`About to run marking tool for submission ${submissionID}.`);

  tmp.file({ mode: 644, prefix: 'results-', postfix: '.html', discardDescriptor: true  },
    (err, path, fd, cleanupCallback) => {
      if (err) {
        cb(err);
        return;
      }

      console.log(`Processing marking of submission ${submissionID} using file ${path} for communication.`);
      // Call cmd and transfer relevant information.
      processConfig(config, (err, env, cleanup) => {
        if (err) {
          cleanup();
          cleanupCallback();
          cb(err);
          return;
        }

        exec(`${cmd} ${path}`, { cwd: sourceDir, env: env },
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
                    cb(err, mark, data);
                  });
                  cleanup();
                  return;
                } else {
                  console.log(`Internal error running marking tool for submission ${submissionID}: ${error}.`);
                  mark = -1;
                  feedback = 'Internal error: testing tool failed to run command.';
                }
              } else {
                console.log(`Marking tool ran successfully for submission ${submissionID}.`);
                feedback = stdout;
              }

              cleanup();
              cleanupCallback();
              cb(null, mark, feedback);
            });
      });
  });
}

// TODO: Check this code against JS spec (especially for use of fold and merge below.)
// TODO: Handle git parameters
function processConfig(config, cb) {
  if (!config) {
    cb(null, {'NEXUS_ACCESS_TOKEN':''}, () => {});
  } else {
    async.mapSeries(Object.keys(config),
      (param, cb) => {
        var env = {};
        env[param] = config[param];
        cb(null, { env: env, cleanup: () => {} });
      },
      (err, result) => {
        cb(err,
          result.fold({'NEXUS_ACCESS_TOKEN':''},
                      (acc, val) => { return val.merge(val.env); }),
          () => {
            result.forEach((val) => { val.cleanup(); });
          });
      }
    );
  }
}
