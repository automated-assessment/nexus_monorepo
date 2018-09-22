package uk.ac.kcl.inf.nexus.io_grader;

import java.io.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Run all io tests specified in a given file.
 */
public class TestRunner {
  public static void main(String[] args) {
    new TestRunner(args).run();
  }

  private String[] args;

  private TestRunner(String[] args) {
    this.args = args;
  }

  private File mainTestFile;
  private String testDirectory;

  private static class TestResult {
    private boolean success;
    private String feedback;

    public TestResult(boolean success, String feedback) {
      this.success = success;
      this.feedback = feedback;
    }

    public boolean wasSuccessful() {
      return success;
    }

    public String getFeedback() {
      return feedback;
    }
  }

  private List<TestResult> results = new ArrayList<>();
  private int numTestsPassed = 0;

  private void run() {
    try {
      mainTestFile = new File(args[0]);
      testDirectory = mainTestFile.getParent();
      if (testDirectory == null) {
        testDirectory = "";
      }

      BufferedReader brTests = new BufferedReader(new FileReader(mainTestFile));

      // We expect the name of the main java class to be listed as the first line of the test specification
      String mainClassName = brTests.readLine();

      // Check class actually exists (do not initialise the class here to avoid running student code
      Class.forName(mainClassName, false, this.getClass().getClassLoader());
      
      String currentTest = brTests.readLine();
      while (currentTest != null) {
        TestResult tr = runTest(currentTest, mainClassName);

        results.add(tr);
        if (tr.wasSuccessful()) {
          numTestsPassed++;
        }

        currentTest = brTests.readLine();
      }

      computeAndOutputMark();
      computeAndOutputFeedback();
    }
    catch (IOException ioe) {
      System.err.println("IO exception: " + ioe);
    }
    catch (ClassNotFoundException cnfe) {
      results.add(new TestResult(false,
            "The expected main class could not be found in your submission."));
    }
    catch (LinkageError le) {
      results.add(new TestResult(false,
            "The expected main class could not be found in your submission."));
    }
    catch (InterruptedException ie) {}
  }

  private TestResult runTest(String testSpecification, String mainClassName) throws IOException, InterruptedException {
    /*
     We expect each line to be of the form "file name -> file name" where
     both file names are relative to the path at which the main test file
     lives. The first file contains input text while the second file
     contains expected output text.
     */
    String testInputPath = testSpecification.substring(0, testSpecification.indexOf ("->")).trim();
    String testOutputPath = testSpecification.substring(testSpecification.indexOf ("->") + 2).trim();

    File testInput = testInputPath.equals("EMPTY")?null:new File(testDirectory + "/" + testInputPath);
    File testOutput = new File(testDirectory + "/" + testOutputPath);

    ProcessBuilder pb = new ProcessBuilder("java", mainClassName);
    pb.environment().put("CLASSPATH", System.getenv().get("CLASSPATH"));
    if (testInput != null) {
      pb.redirectInput(testInput);
    }

    Process pRunning = pb.start();

    // TODO Make timeout configurable
    if (pRunning.waitFor(1, TimeUnit.MINUTES)) {
      // Successfully terminated within time allotted
      if (pRunning.exitValue() == 0) {
        // Check program output

        try (
          BufferedReader brError = new BufferedReader(new InputStreamReader(pRunning.getErrorStream()));
          BufferedReader brOutput = new BufferedReader(new InputStreamReader(pRunning.getInputStream()));
          BufferedReader brExpectedOutput = new BufferedReader(new FileReader(testOutput))
        ) {
          StringBuffer sbError = new StringBuffer();
          String sError;
          while ((sError = brError.readLine()) != null) {
            sbError.append("\n").append(sError);
          }
          if (sbError.length() > 0) {
            return new TestResult(false,
            "Your programme produced error output: " + sbError);
          }

          String sOutput;
          String sExpectedOutput;
          do {
            sOutput = brOutput.readLine();
            sExpectedOutput = brExpectedOutput.readLine();

            if ((sOutput == null) && (sExpectedOutput != null)) {
              return new TestResult(false,
                  "Your programme's output terminated unexpectedly.");
            }

            if ((sOutput != null) && (sExpectedOutput == null)) {
              return new TestResult(false,
                  "Your programme produced more lines of output than expected.");
            }

            if ((sOutput != null) && (sExpectedOutput != null) && (!sOutput.equals(sExpectedOutput))) {
              return new TestResult(false,
                  "A line of your programme's output was different from what I expected.\n"+
                  "Your programme printed: \"" + sOutput + "\"\n" +
                  "I expected to see:      \"" + sExpectedOutput + "\"");
            }
          } while ((sOutput != null) && (sExpectedOutput != null));
        }

        return new TestResult(true, "Your programme passed this test.");
      } else {
        return new TestResult(false,
            "Your programme returned a non-zero exit value of " +
            pRunning.exitValue() +
            " indicating an error occurred during execution.");
      }
    } else {
      // Kill process and report timeout
      pRunning.destroyForcibly();

      return new TestResult(false,
          "Your programme took longer than 1 minute to complete the test and was stopped forcibly.");
    }
  }

  private void computeAndOutputMark() throws IOException {
    int mark = (int) Math.round(Math.floor(100 * (float) numTestsPassed / results.size()));

    writeToFile(args[2], Integer.toString(mark));
  }

  private void computeAndOutputFeedback() throws IOException {
    StringBuffer sbFeedback = new StringBuffer();

    if (numTestsPassed == results.size()) {
      sbFeedback.append("<p>All tests passed successfully.");
    } else {
      sbFeedback.append("<p>Some tests produced errors. Feedback for these tests is included below.</p>");
      sbFeedback.append("<ul>");
      for (TestResult tr : results) {
        if (!tr.wasSuccessful()) {
          sbFeedback
            .append("<li><pre>")
            .append(tr.getFeedback())
            .append("</pre></li>");
        }
      }
      sbFeedback.append("</ul>");
    }

    writeToFile(args[1], sbFeedback.toString());
  }

  private void writeToFile (String fileName, String data) throws IOException {
    BufferedWriter out = new BufferedWriter(new FileWriter(fileName));
    out.write(data);
    out.close();
  }
}
