package uk.ac.kcl.inf.nexus.javac_grader;

import javax.tools.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Entry point for compiling java files and analysing compiler messages.
 */
public class CompileSubmission {
  public static void main(String[] args) {
    new CompileSubmission()
        .compile()
        .reportMark(args[1])
        .reportFeedback(args[0]);
  }

  private DiagnosticAnalyser[] analysers = {};
  private DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();

  private StringWriter swOutput = new StringWriter();
  private Exception compilerException = null;

  private List<File> files = null;

  // TODO Carefully check parameters, especially where they're null.
  private CompileSubmission compile() {
    try {
      JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();

      files = getFiles();
      StandardJavaFileManager fileManager = compiler.getStandardFileManager(diagnostics, null, StandardCharsets.UTF_8);
      Iterable<? extends JavaFileObject> compilationUnits = fileManager.getJavaFileObjectsFromFiles(files);

      List<String> options = new ArrayList<String>();
      options.add("-Xlint:all");

      compiler
      .getTask(swOutput, fileManager, diagnostics, options, null, compilationUnits)
      .call();

      fileManager.close();
    }
    catch (Exception e) {
      compilerException = e;
    }

    return this;
  }

  private CompileSubmission reportMark(String fileName) {
    int mark = 0;

    if (diagnostics.getDiagnostics().isEmpty() && swOutput.toString().isEmpty()) {
      mark = 100;
    } else {
      mark = 0;
    }

    try {
      writeToFile(fileName, Integer.toString(mark));
    }
    catch (IOException ioe) {
      System.err.println("Exception writing mark file: " + ioe);
    }

    return this;
  }

  private CompileSubmission reportFeedback(String fileName) {
    StringBuffer sb = new StringBuffer();

    // Report which files we tried to compile
    sb.append("<div>");
    sb.append("<p>List of java files found:</p><ul>");
    for (File f : files) {
      sb.append("<li>").append(f.getName()).append("</li>");
    }
    sb.append("</ul></div>");

    if (diagnostics.getDiagnostics().isEmpty() && swOutput.toString().isEmpty()) {
      sb.append("<p>All java files compiled successfully.");
    } else {
      Map<DiagnosticAnalyser, List<Diagnostic>> analysisIndex = new HashMap<>();

      // First, show feedback directly from compiler. This should probably go into a separate tab
      sb.append("<div><p>Compiler error messages.</p>");
      if (!swOutput.toString().isEmpty()) {
        sb.append("<p>")
          .append(swOutput.toString())
          .append("</p>");
      }
      for(Diagnostic<? extends JavaFileObject> diagnostic : diagnostics.getDiagnostics()){
        sb.append(diagnostic.toString());
        sb.append("<br/><br/>");

        // See if any analyser is interested in providing more context for this.
        for (DiagnosticAnalyser da : analysers) {
          if (da.canHandle(diagnostic)) {
            List<Diagnostic> l = analysisIndex.get(da);
            if (l == null) {
              l = new ArrayList<>();
              analysisIndex.put(da, l);
            }

            l.add(diagnostic);

            break;
          }
        }
      }
      sb.append("</div>");

      if (!analysisIndex.isEmpty()) {
        for (DiagnosticAnalyser da : analysisIndex.keySet()) {
          sb.append("<div>");
          sb.append(da.handle(analysisIndex.get(da)));
          sb.append("</div>");
        }
      }
    }

    try {
      writeToFile(fileName, sb.toString());
    }
    catch (IOException ioe) {
      System.err.println("Exception writing feedback file: " + ioe);
    }

    return this;
  }

  private List<File> getFiles() {
    return getFiles(new File("."));
  }

  private List<File> getFiles(File dir) {
    List<File> result = new ArrayList<>();

    for (File f: dir.listFiles()) {
      if (f.isFile()) {
        if (f.getName().endsWith (".java")) {
          result.add (f);
        }
      } else if (f.isDirectory()) {
        result.addAll (getFiles(f));
      }
    }

    return result;
  }

  private void writeToFile (String fileName, String data) throws IOException {
    BufferedWriter out = new BufferedWriter(new FileWriter(fileName));
    out.write(data);
    out.close();
  }
}
