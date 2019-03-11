package uk.ac.kcl.inf.nexus.javac_grader.analysers;

import uk.ac.kcl.inf.nexus.javac_grader.DiagnosticAnalyser;

import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;

import java.util.*;
import java.io.*;
import javax.tools.*;

public class StaticAnalyser implements DiagnosticAnalyser {
  private final String staticMethodsErr = "static method should be qualified by type name";
	private final String staticVariablesErr = "static variable should be qualified by type name";

  public boolean canHandle(Diagnostic d) {
    return d.getMessage(null).contains(staticMethodsErr) ||
        d.getMessage(null).contains(staticVariablesErr);
  }

  // TODO: This should really do a bit more analysis and include the names of the relevant context and method names etc.
  public String handle(List<Diagnostic> diagnostics, VelocityEngine ve, VelocityContext context) {
    boolean varDone = false;
    boolean methodDone = false;

    StringBuffer sb = new StringBuffer();

    for (Diagnostic d : diagnostics) {
      Template t = null;
      String diagnostic = d.toString();
      StringWriter writer = new StringWriter();

      if (diagnostic.contains (staticMethodsErr)) {
        t = ve.getTemplate("staticTemplate.vm");
        methodDone = true;
      } else if (diagnostic.contains(staticVariablesErr)) {
        t = ve.getTemplate("staticVariablesTemplate.vm");
        varDone = true;
      }

      if (t != null) {
        t.merge (context, writer);
        sb.append(writer.toString().replaceAll("\n", "<br/>"));
      }

      if (varDone && methodDone) {
        break;
      }
    }

    return sb.toString();
  }
}
