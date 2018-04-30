package uk.ac.kcl.inf.nexus.junit_grader;

import org.junit.runner.JUnitCore;
import org.junit.runner.Result;
import org.junit.runner.Description;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunListener;

import uk.ac.kcl.inf.nexus.junit_grader.annotations.TestWeight;
import uk.ac.kcl.inf.nexus.junit_grader.annotations.TestDescription;

import java.io.*;

/**
 * Run all tests specified in a class called TestSpecification in the default
 * package in the current class path.
 */
public class TestRunner {
  public static void main(String[] args) {
    try {
      System.out.println("Running tests...");

      final int[] totalTestWeight = { 0 };
      final int[] totalTestCount = { 0 };

      JUnitCore tester = new JUnitCore();
      tester.addListener (new RunListener() {
        @Override
        public void testFinished(Description description) throws Exception {
          TestWeight tw = description.getAnnotation(TestWeight.class);
          if (tw != null) {
            totalTestWeight[0] += tw.value();
          } else {
            totalTestWeight[0] += 1;
          }
          totalTestCount[0]++;
        }
      });
      Result result = tester.run (Class.forName("TestSpecification"));
      System.out.println("Finished running tests.");

      computeAndOutputMark(result, totalTestWeight[0], args[1]);
      computeAndOutputFeedback(result, totalTestCount[0], args[0]);
    }
    catch (ClassNotFoundException e) {
      System.err.println("Couldn't find test class.");
    }
    catch (IOException ioe) {
      System.err.println ("Exception writing to output files: " + ioe);
    }
  }

  private static void computeAndOutputMark (Result result, int totalTestWeight, String fileName) throws IOException {
    int marksAchieved = totalTestWeight;
    for (Failure f : result.getFailures()) {
      TestWeight tw = f.getDescription().getAnnotation(TestWeight.class);
      if (tw != null) {
        marksAchieved -= tw.value();
      } else {
        marksAchieved -= 1;
      }
    }

    System.out.println("Marks achieved: " + marksAchieved + "; total marks available: " + totalTestWeight + ".");

    int mark = (int) Math.round (Math.floor (((float) marksAchieved / totalTestWeight) * 100));

    System.out.println("Mark will be " + mark);

    writeToFile(fileName, Integer.toString(mark));
  }

  private static void computeAndOutputFeedback (Result result, int totalTestCount, String fileName) throws IOException {
    StringBuffer sbFeedback = new StringBuffer("<div>");
    if (result.wasSuccessful()) {
      sbFeedback.append ("<p>All tests passed.</p>");
    } else {
      sbFeedback.append ("<p>" + result.getFailures().size() + "/" + totalTestCount + " tests had problems:</p><ol>");
      for (Failure f : result.getFailures()) {
        String description = "";
        TestDescription td = f.getDescription().getAnnotation(TestDescription.class);
        if (td != null) {
          description = td.value();
        } else {
          description = f.getDescription().getMethodName();
        }
        sbFeedback
          .append ("<li>")
            .append(description).append(": ").append (f.getMessage())
          .append ("</li>");
      }
      sbFeedback.append("</ol>");
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
