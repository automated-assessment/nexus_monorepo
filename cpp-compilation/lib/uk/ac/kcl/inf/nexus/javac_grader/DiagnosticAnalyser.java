package uk.ac.kcl.inf.nexus.javac_grader;

import javax.tools.*;
import java.util.*;
import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;

/**
 * An analyser for a type of compilation diagnostic.
 */
public interface DiagnosticAnalyser {
  public boolean canHandle(Diagnostic d);

  public String handle(List<Diagnostic> diagnostics, VelocityEngine ve, VelocityContext context);
}
