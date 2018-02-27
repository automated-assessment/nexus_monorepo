import tmp from 'tmp';

// TODO Implement default grade_submission.sh script
const cmd = process.env.TOOL_CMD ? process.env.TOOL_CMD : '/usr/src/app/grade_submission.sh';

export function doMarkSubmission(submissionID, sourceDir, cb) {
  console.log(`About to run marking tool for submission ${submissionID}.`);

  tmp.file({ mode: 0644, prefix: 'results-', postfix: '.html', discardDescriptor: true  },
    (err, path, fd, cleanupCallback) => {
      if (err) {
        cb(err);
        return;
      }

      console.log(`Processing marking of submission ${submissionID} using file ${path} for communication.`);
      // Call cmd and transfer relevant information.
      exec(`${cmd} ${path}`, { cwd: sourceDir, env: {'NEXUS_ACCESS_TOKEN':''} },
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

          cleanupCallback();
          cb(null, mark, feedback);
        });
  });
}
