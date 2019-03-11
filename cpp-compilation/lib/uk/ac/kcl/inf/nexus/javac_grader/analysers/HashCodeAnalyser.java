package uk.ac.kcl.inf.nexus.javac_grader.analysers;

import uk.ac.kcl.inf.nexus.javac_grader.DiagnosticAnalyser;

import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;

import java.util.*;
import java.io.*;
import javax.tools.*;

public class HashCodeAnalyser implements DiagnosticAnalyser {
  public boolean canHandle(Diagnostic d) {
    return d.getMessage(null).contains("overrides equals, but neither it nor any superclass overrides hashCode method");
  }

  public String handle(List<Diagnostic> diagnostics, VelocityEngine ve, VelocityContext context) {
    Template t = ve.getTemplate("hashcodeTemplate.vm");
    StringWriter writer = new StringWriter();
    t.merge(context, writer);
    return writer.toString().replaceAll("\n", "<br/>");
  }
}
