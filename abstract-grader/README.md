## Nexus - Abstract Grader

This is not meant to be run as a grader directly. Instead, it provides a base Docker image from which many graders can be easily instantiated using the instructions below.

### Creating a new grader based on abstract grader

Creating a new grader based on abstract grader is straightforward:

1. Create a new folder in the root of the monorepo and name it after your new grader.
2. Add a `Dockerfile` starting with `FROM abstract-grader`.
3. You can implement your grading functionality either as a shell script or in JavaScript:
  - _Shell script graders_:
    1. Add a file called `grade_submission.sh` in your grader directory and make it executable.
    2. Add `COPY grade_submission.sh /usr/src/app` to the end of your `Dockerfile`.
    3. Implement your grading functionality in this new shell script. Return any mark as the script exit code. Exit codes outside the 0..100 range will be interpreted as errors. The shell script will be provided with a file name as its first parameter. Put any feedback into this file, formatted as HTML with bootstrap styling as appropriate. The files from the submission will be in the working directory in which your script is invoked.
  - _JavaScript graders_:
    1. Add a file `mark_submission.js` in your grader directory.
    2. Add `COPY mark_submission.js /usr/src/app` to the end of your `Dockerfile`.
    3. Ensure this file exports a function `export function doMarkSubmission(submissionID, sourceDir, cb)`. In this function, implement your grading process. Make sure to use node.js asynchronous execution sensibly. When you're done grading, invoke `cb(error, mark, feedback)`, where `error` is an error object or `null` if all went well, `mark` is the mark to report to Nexus, and `feedback` is the HTML-formatted feedback to report to Nexus.
    4. If you need to provide a `package.json` file to declare dependencies beyond those already included in `abstract-grader`, create this in your source directory. Make sure to include all dependencies currently listed in [`abstract-grader`'s `package.json` file](package.json). Add the following lines to your `Dockerfile`:
      ```
      # Install app dependencies
      COPY package.json /usr/src/app/
      RUN npm install
      ```
4. Add the new grader to the relevant [docker-compose files](/DOCKER-COMPOSE-FILES.md) as usual.

### Grader configuration

<TBD>

### Service configuration

Any grader based on `abstract-grader` will support the usual configuration options through the usal environment variables. In addition, the following variable is also supported:

- `MAX_CONCURRENCY`: This defines the maximum number of grading processes that can run in parallel. By default it is set to 1.

### Tech
- Node.js (4.x)
  - Express (4.x)
  - Written in ES6 using Babel with `stage-0` proposals enabled
  - _See `package.json` for full list of packages_
