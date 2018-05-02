# Java I/O grader
This grader assesses java programs based on their input-output behaviour.
Teachers can define a number of textual inputs and outputs in separate files.
These inputs are played out to the program one-by-one and the program's output
is compared to the corresponding expectd output. Any differences lead to that
test failing and corresponding feedback being generated.

# Grader configuration
The grader can be configured by providing a reference to a commit on GHE. In that
commit, the grader expects to find a file called `IO_specification.tests` at the
root of the repository. This file defines all the tests.

The first line of the file names the main class to be run, using its fully
qualified name with package names separated by periods.

The remaining lines each define a test. The format is `<input file name> -> <output file name>`.
These file names are relative to the repository root. Both files are expected to
be simple text files. The input file contains the input to be fed to the programme
while the output file contains the output expected. Currently, the grader only
supports exact matching as the comparison technique, but more lenient tests may
be implemented in the future. Tests are executed in the order in which they
appear in the specification file.

As a special case, the `<input file name>` can be `EMPTY`. In this case, the
program is not provided any input, but its output is still compared to the
expected output provided.

Each test run is timeboxed at 1 minute. After that, the student programme is
forcibly terminated and a corresponding piece of feedback and a mark of 0 is
reported to Nexus.

# Setup
This is an [abstract grader](../abstract-grader/README.md) instance and, as such,
all configuration options for abstract graders apply.
