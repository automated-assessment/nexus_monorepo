# CPPUnit grader
A CPPUnit grader for Nexus. This allows student submissions to be marked against
functional tests expressed using `CPPUnit`.

## Writing tests

Tests for the grader are provided through a (private) GHE repository. The user
for which Nexus has been set up (often a machine user) needs to have access to
this repository, but the grader configuration page will point this out. In the
repository, there must be a `TestSpecification` class defined in the default
package. Only C++ files need to be provided as they will be compiled as and
when required. The C++ files can be anywhere in the git repository. 

`TestSpecification` can be a test suite or a standard class with CPPUnit Test
methods.
