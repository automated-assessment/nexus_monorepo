# jUnit grader
A jUnit grader for Nexus. This allows student submissions to be marked against
functional tests expressed using `jUnit 4.12`.

## Writing tests

Tests for the grader are provided through a (private) GHE repository. The user
for which Nexus has been set up (often a machine user) needs to have access to
this repository, but the grader configuration page will point this out. In the
repository, there must be a `TestSpecification` class defined in the default
package. Only java files need to be provided as they will be compiled as and
when required. The java files can be anywhere in the git repository. Any `.jar`
files in the repository will also be picked up and used when compiling and
executing the tests.

`TestSpecification` can be a test suite or a standard class with jUnit `@Test`
methods. Individual test methods can be annotated with two additional annotations
(these are available from a 
[separate repository](https://github.kcl.ac.uk/automated-assessment/junit_annotations)):

1. `uk.ac.kcl.inf.nexus.junit_grader.annotations.TestWeight`: This defines the relative weight with which the test contributes to the overall mark. Note that there's no need for weight values to add up to 100 or to be otherwise normalised, the grader will automatically compute contributions as a ratio of the sum of all weights. If no `TestWeight` annotation is provided, 1 is assumed.
2. `uk.ac.kcl.inf.nexus.junit_grader.annotations.TestDescription`: This provides a textual description of the test to be included in any feedback sent to students when this particular test fails. If omitted, the name of the test method is used instead.
