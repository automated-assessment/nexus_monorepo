package uk.ac.kcl.inf.nexus.junit_grader;

import org.junit.runner.JUnitCore;
import org.junit.runner.Result;
import org.junit.runner.notification.Failure;

import java.io.*;

/**
 * Run all tests specified in a class called TestSpecification in the default
 * package in the current class path.
 */
public class TestRunner {
  public static void main(String[] args) {
    try {
      System.out.println("Running tests...");
      Result result = JUnitCore.runClasses (Class.forName("TestSpecification"));
      System.out.println("Finished running tests.");

      computeAndOutputMark(result, args[1]);
      computeAndOutputFeedback(result, args[0]);
    }
    catch (ClassNotFoundException e) {
      System.err.println("Couldn't find test class.");
    }
    catch (IOException ioe) {
      System.err.println ("Exception writing to output files: " + ioe);
    }
  }

  private static void computeAndOutputMark (Result result, String fileName) throws IOException {
    int mark = (int) Math.round (Math.floor (((result.getRunCount() - result.getFailureCount()) / result.getRunCount()) * 100));

    System.out.println("Mark will be " + mark);

    writeToFile(fileName, Integer.toString(mark));
  }

  private static void computeAndOutputFeedback (Result result, String fileName) throws IOException {
    StringBuffer sbFeedback = new StringBuffer("<div>");
    if (result.wasSuccessful()) {
      sbFeedback.append ("<p>All tests passed.</p>");
    } else {
      sbFeedback.append ("<p>Some tests had problems:</p>");
      for (Failure f : result.getFailures()) {
        sbFeedback.append ("<div>")
        .append ("  ").append (f.getMessage())
        .append ("</div>");
      }
    }
    sbFeedback.append("</div>");

    System.out.println("Feedback is " + sbFeedback);

    writeToFile(fileName, sbFeedback.toString());
  }

  private static void writeToFile (String fileName, String data) throws IOException {
    BufferedWriter out = new BufferedWriter(new FileWriter(fileName));
    out.write(data);
    out.close();
  }
}
