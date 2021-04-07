## Nexus - Grader test tool

Tool for running automated tests of grading services. This tool allows defining black-box regression tests against grading services. It mocks up a Nexus service and uses it to send mock submission requests to grading services, checking the marks and feedback produced against pre-defined expected responses.

### Usage

Normally, it should be enough to say `make test-graders` in the monorepo root to run all defined tests.

**Only run this in a working copy that is separate from your normal development copy, as some of the graders may be reusing their normal databases during testing.**

When a new version of the grader test tool appears, you may have to run `make build-tests` first to make sure the latest version is packaged as a Docker container. If things get really stuck, you may be able to use `make stop-tests` to shut down the entire test infrastructure.

### Defining tests

All tests are defined in [tests.yml](tests/scripts/tests.yml). This file contains two keys: `graders` lists information about the grading tools to be tested. `test` lists the individual tests to be run; these will be executed in the order in which they appear in the file.

#### Grader definitions

Under the `graders` key, there should be an entry for each grader to be tested. The entry should be named for the grader (this name is used in test definitions to identify the graders for which to run the tests) and contain information about how to access the grader. For example, for the javac-tool, one would write:

```
graders:
  javac-tool:
    canonical_name: javac
    port: 5000
    mark: /mark
```

Here, `canonical_name` is the canonical name configured for the tool. This must correspond to what is configured in the corresponding `.env` file. `port` is the container port number at which the grader is listening (note this is not the host port number to which this may be mapped in docker-compose.yml). `mark` identifies the endpoint URL for mark requests (relative to the tool base URL). Note that your grading tool must be able to gracefully handle `HEAD` requests against this endpoint and respond to them with a `HTTP/200` response.

#### Test definitions

Tests consist of two parts: a folder with files to be included in the mock submission, and a set of keys describing which graders to send the submission to and what results to expect from them. For example, we might write

```
tests:
  compile:
    submission: basic_compiles
    graders:
      javac-tool:
        mark: 100
        feedback: dontcare
```

This defines a test called `compile`, which uses the files in directory [`tests/scripts/test_files/basic_compiles`](tests/scripts/test_files/basic_compiles). This submission will be sent to the `javac-tool` grader, which is expected to return a mark of 100. It is expected to return some feedback, but we do not care about what it is.

### Open items

- The test tool doesn't yet properly support feedback checking (mainly, because I need to develop a sensible way of encoding the expected feedback text without messing up the yml file).

- The test tool doesn't yet support configurable tools. This would require an API endpoint to send configuration data to a grader (rather than the current interactive endpoint).

- The test tool doesn't yet support tools that have an interactive component. I'm thinking of supporting these by supporting additional post-submit mocks to be run before the test results are expected.
