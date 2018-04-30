package uk.ac.kcl.inf.nexus.javac_grader;

import javax.tools.*;

import java.io.*;

import java.nio.charset.StandardCharsets;

import java.util.*;

import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.runtime.*;
import org.apache.velocity.runtime.resource.loader.*;

import uk.ac.kcl.inf.nexus.javac_grader.analysers.*;

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

  public CompileSubmission() {
    files = getFiles();

    analysers = new DiagnosticAnalyser[] {
        new MissingSymbolAnalyser(files),
        new HashCodeAnalyser(),
        new StaticAnalyser()
      };
  }

  // TODO Carefully check parameters, especially where they're null.
  private CompileSubmission compile() {
    try {
      JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();

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
    boolean allOK = diagnostics.getDiagnostics().isEmpty() && swOutput.toString().isEmpty();
    StringBuffer sb = new StringBuffer();
    Map<DiagnosticAnalyser, List<Diagnostic>> analysisIndex = new HashMap<>();

    StringBuffer sbJavacOutput = new StringBuffer();
    StringBuffer sbDiagnostics = new StringBuffer();

    VelocityEngine ve = new VelocityEngine();
    ve.setProperty(RuntimeConstants.RESOURCE_LOADER, "file");
    ve.setProperty(RuntimeConstants.FILE_RESOURCE_LOADER_PATH, "/usr/src/app/bin");
    //ve.setProperty("classpath.resource.loader.class", FileResourceLoader.class.getName());
    ve.init();

    VelocityContext context = new VelocityContext();

    if (!allOK) {
      // First, show feedback directly from compiler. This should probably go into a separate tab
      sbJavacOutput.append("<p>Compiler error messages.</p>");
      sbJavacOutput.append("<pre>");
      if (!swOutput.toString().isEmpty()) {
        sbJavacOutput.append(swOutput.toString());
      }
      for (Diagnostic<? extends JavaFileObject> diagnostic : diagnostics.getDiagnostics()) {
        sbJavacOutput.append(diagnostic.toString());
        sbJavacOutput.append("\n\n");

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
      sbJavacOutput.append("</pre>");

      if (!analysisIndex.isEmpty()) {
        for (DiagnosticAnalyser da : analysisIndex.keySet()) {
          sbDiagnostics.append("<div>");
          sbDiagnostics.append(da.handle(analysisIndex.get(da), ve, context));
          sbDiagnostics.append("</div>");
        }
      }
    }

    String[] fileNames = new String[files.size()];
    int i = 0;
    for (File f : files) {
      fileNames[i++] = f.getName();
    }
    Template t = ve.getTemplate ("templates/output.vm");
    context.put ("allOK", allOK);
    context.put ("diagnostics", sbDiagnostics.toString());
    context.put ("javacOutput", sbJavacOutput.toString());
    context.put ("files", fileNames);
    StringWriter writer = new StringWriter();
    t.merge (context, writer);
    sb.append(writer.toString());
    // System.out.println("Will produce the following feedback: \n" + writer.toString() + "\n");

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
