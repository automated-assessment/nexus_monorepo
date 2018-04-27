package uk.ac.kcl.inf.nexus.javac_grader;

import javax.tools.*;
import java.util.*;

/**
 * An analyser for a type of compilation diagnostic.
 */
public interface DiagnosticAnalyser {
  public boolean canHandle(Diagnostic d);

  public String handle(List<Diagnostic> diagnostics);
}
