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
    3. Ensure this file exports a function `export function doMarkSubmission(aid, studentuid, submissionID, sourceDir, config, is_unique, cb)`. In this function, implement your grading process. `config` will be a hash of the configuration data for this assignment (see below), if any. Make sure to use node.js asynchronous execution sensibly. When you're done grading, invoke `cb(error, mark, feedback)`, where `error` is an error object or `null` if all went well, `mark` is the mark to report to Nexus, and `feedback` is the HTML-formatted feedback to report to Nexus.
    4. If you need to provide a `package.json` file to declare dependencies beyond those already included in `abstract-grader`, create this in your source directory. Make sure to include all dependencies currently listed in [`abstract-grader`'s `package.json` file](package.json). Add the following lines to your `Dockerfile`:

      ```
      # Install app dependencies
      COPY package.json /usr/src/app/
      RUN npm install
      ```

4. Add the new grader to the relevant [docker-compose files](/DOCKER-COMPOSE-FILES.md) as usual. The grader will need to be provided access to a MySQL database and the `AUTH_TOKEN` environment variable needs to be defined (preferably through a `.env` file).

### Grader configuration

Graders built on the `abstract-grader` image can be configurable. To enable configuration, all you have to do is to provide the schema of configuration data. This will enable a configuration endpoint `/:auth_token/configure`. `auth_token` will be replaced by whatever you define in the `AUTH_TOKEN` environment variable, which is mandatory even if you do not enable grader configuration.

To define the configuration-data schema, provide a file `config_schema.yml` with your grader sources. This will be automatically picked up by the `abstract-grader` image, and a configuration page will be generated. This file should follow the following schema:

```
parameters:
  paramName:
    label: Label to use in configuration page.
    description: Additional description to provide in configuration page.
    type: int or git
    ... additional data depeding on type ...
```

Currently, two types of configuration parameters are supported:

1. `int` parameters are numberic values. You can additionally specify `min`, `max`, `step`, and `initial`, which should be self-explanatory. The values of `int` parameters are passed to the shell script as environment variables named `paramName`, and as a value under that key in `config` to the javascript method.
2. `git` parameters allow files to be provided to the grader through a git commit. Git commits are specified by providing a repository URL (must be a SSH-protocol URL of the form `git@github.kcl.ac.uk/{user}/{repository}`), a branch, and a SHA. When calling the javascript mark function, these values are passed in a hash under the `paramName` key in config. For  shell-script graders, the files will already have been checked out (freshly for each grader run) and the name of the directory will be in an environment variable `paramName`. Note that files will not be checked out yet when the javascript function is called. You can additionally specify a `uniquify` block containing an array of file globs (as per the documentation for the [`node-glob` module](https://www.npmjs.com/package/glob)) relative to the repository root. If present, and if the current assignment is unique, `abstract-grader` will send all matching files to the unique assignment tool and replace them with their uniquified version before calling the grading shell script.

All configurable graders need access to a MySQL instance to store configuration data. See the configuration of `sample-abstract-grader` for information on how to do this. At the moment, each grader has its own instance, but this is clearly inefficient and will change in the future.

### Service configuration

Any grader based on `abstract-grader` will support the usual configuration options through the usal environment variables. In addition, the following variable is also supported:

- `MAX_CONCURRENCY`: This defines the maximum number of grading processes that can run in parallel. By default it is set to 1.
- `AUTH_TOKEN`: authorisation token to be used in configuring the grader. Should be a random as possible.

### Tech
- Node.js (4.x)
  - Express (4.x)
  - Written in ES6 using Babel with `stage-0` proposals enabled
  - _See `package.json` for full list of packages_
