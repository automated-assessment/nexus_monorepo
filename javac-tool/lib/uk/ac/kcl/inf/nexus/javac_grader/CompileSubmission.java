package uk.ac.kcl.inf.nexus.javac_grader;

import javax.tools.*;
import java.io.*;
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

  private DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();

  // TODO Carefully check parameters, especially where they're null.
  private CompileSubmission compile() {
    JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();

    List<File> files = getFiles();
    StandardJavaFileManager fileManager = compiler.getStandardFileManager(diagnostics, null, null);
    Iterable<? extends JavaFileObject> compilationUnits = fileManager.getJavaFileObjectsFromFiles(files);

    List<String> options = new ArrayList<String>();
    options.add("-Xlint:all");

    compiler
        .getTask(null,fileManager, diagnostics, options, null, compilationUnits)
        .call();

    return this;
  }

  private CompileSubmission reportMark(String fileName) {
    int mark = 0;

    if (diagnostics.getDiagnostics().isEmpty()) {
      mark = 100;
    } else {
      mark = 0;
    }

    

    return this;
  }

  private CompileSubmission reportFeedback(String fileName) {
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
  }
}
