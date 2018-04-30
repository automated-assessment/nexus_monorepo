package uk.ac.kcl.inf.nexus.io_grader;

import java.io.*;

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

  private void run() {
    try {
      mainTestFile = new File(args[0]);
      testDirectory = mainTestFile.getParent();
      if (testDirectory == null) {
        testDirectory = "";
      }

      BufferedReader brTests = new BufferedReader(new FileReader(mainTestFile));

      String currentTest = brTests.readLine();
      while (currentTest != null) {
        runTest(currentTest);

        currentTest = brTests.readLine();
      }
    } catch (IOException ioe) {
      System.err.println("IO exception: " + ioe);
    }
  }

  private static void runTest(String testSpecification) {
    /*
     We expect each line to be of the form "file name -> file name" where
     both file names are relative to the path at which the main test file
     lives. The first file contains input text while the second file
     contains expected output text.
     */
    String testInputPath = currentTest.substring(0, currentTest.indexof ("->")).trim();
    String testOutputPath = currentTest.substring(currentTest.indexof ("->") + 2).trim();

    File testInput = new File(testDirectory + "/" + testInputPath);
    File testOutput = new File(testDirectory + "/" + testOutputPath);

    // FIXME: Get actual mainfile
    ProcessBuilder pb = new ProcessBuilder("java", "Mainfile");
    pb.environment().put("CLASSPATH", System.getenv().get("CLASSPATH"));
    pb.redirectInput(testInput)
      .redirectOutput(ProcessBuilder.Redirect.PIPE);

    Process pRunning = pb.start();

    // TODO: Check program output
  }

  private static void writeToFile (String fileName, String data) throws IOException {
    BufferedWriter out = new BufferedWriter(new FileWriter(fileName));
    out.write(data);
    out.close();
  }
}
