package uk.ac.kcl.inf.nexus.javac_grader.analysers;

import uk.ac.kcl.inf.nexus.javac_grader.DiagnosticAnalyser;

import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;

import org.apache.commons.text.similarity.LevenshteinDistance;

import java.util.*;
import java.io.*;
import javax.tools.*;


public class MissingSymbolAnalyser implements DiagnosticAnalyser {
  private List<File> fileList;

  public MissingSymbolAnalyser(List<File> fileList) {
    this.fileList = fileList;
  }

  public boolean canHandle(Diagnostic d) {
    return d.getMessage(null).contains("cannot find symbol");
  }

  private enum SymbolType {
    CLASS, VARIABLE
  }

  private class SymbolData {
    public String symbol;
    public SymbolType symbolType;

    @Override
    public int hashCode() {
      return symbol.hashCode() + symbolType.hashCode();
    }

    @Override
    public boolean equals(Object o) {
      if (o instanceof SymbolData) {
        SymbolData sd = (SymbolData) o;
        return (sd.symbol.equals(symbol) && (sd.symbolType == symbolType));
      } else {
        return false;
      }
    }
  }

  private class ErrorData {
    public long lineNumber;
    public String location;
  }

  public String handle(List<Diagnostic> diagnostics, VelocityEngine ve, VelocityContext context) {
    StringBuffer sb = new StringBuffer();
    sb.append("<div><p>Some errors referred to missing symbols. These are explained below:</p><ol>");

    Map<SymbolData, List<ErrorData>> errors = new HashMap<>();
    for (Diagnostic d : diagnostics) {
      analyse (d, errors);
    }

    for (SymbolData sd : errors.keySet()) {
      sb.append(feedbackFor (sd, errors.get(sd), ve, context));
    }
    sb.append("</ol></div>");

    return sb.toString();
  }

  private void analyse(Diagnostic d, Map<SymbolData, List<ErrorData>> errors) {
    SymbolData sd = new SymbolData();
    ErrorData ed = new ErrorData();

    ed.lineNumber = d.getLineNumber();
    String diagnostic = d.toString();

    String sym = diagnostic.substring (diagnostic.indexOf ("^") + 1);

    String[] split = sym.split (" ");
    ArrayList<String> sym_list = new ArrayList<String>();
    for (int i = 0; i < split.length; i++) {
      if (!split[i].equals("")) {
        sym_list.add(split[i]);
      }
    }

    for (int i = 0; i < sym_list.size(); i++){
      if(sym_list.get(i).contains("location")){
        ed.location = sym_list.get (i + 2);
      }
    }

    for (int j = 0; j < sym_list.size(); j++) {
      if (sym_list.get (j).contains ("symbol")) {
        sd.symbol = sym_list.get (j + 2);
        sd.symbol = sd.symbol.replaceAll("\n", "");

        if (sym_list.get (j + 1).contains ("class")) {
          sd.symbolType = SymbolType.CLASS;
          break;
        } else if (sym_list.get (j + 1).contains ("variable")) {
          sd.symbolType = SymbolType.VARIABLE;
          break;
        }
      }
    }

    List<ErrorData> l = errors.get(sd);
    if (l == null) {
      l = new ArrayList<>();
      errors.put(sd, l);
    }
    l.add(ed);
  }

  private String feedbackFor(SymbolData sd, List<ErrorData> l, VelocityEngine ve, VelocityContext context) {
    if (sd.symbolType == SymbolType.VARIABLE) {
      Template t = ve.getTemplate ("templates/missingVar.vm");

      StringBuffer sb = new StringBuffer();

      for (ErrorData ed : l) {
        context.put ("symbol", sd.symbol);
        context.put ("location", ed.location);
        StringWriter writer = new StringWriter();
        t.merge (context, writer);

        sb.append("<li>").append(writer.toString().replaceAll ("\n", "<br/>")).append("</li>");
      }

      return sb.toString();
    } else {
      return checkClassIdentifier (sd, l, ve, context);
    }
  }

  /*
	 * The 'checkClassIdentifier()' method is called when the compiler has
   * identified a missing class that has been referenced. This is normally
   * caused by misspelling a class name, forgetting to import a library or
   * forgetting to include a class file. The method first checks whether the
   * class that is being referenced has a corresponding class file within the
   * directory. In most cases, this will be false. If there is a missing class
   * file, then the method calculates the Levenshtein Distance between the class
   * file that should exist and every file in the directory. This checks whether
   * a typo has been made, and a Levenshtein Distance of 1 is used to do so. If
   * two files have a Levenshtein Distance of 1, then they differ by only one
   * character. If any files do have a difference of 1, then the contents of
   * the template 'levenshteinTemplate.vm' is set as the analyser's output. If
   * none of the files return a difference of 1, then the contents of the
   * template 'missingClass.vm' is set as the analyser's output.
	 */
	private String checkClassIdentifier(SymbolData sd, List<ErrorData> l,
      VelocityEngine ve, VelocityContext context){
		String sym_concat = sd.symbol.concat(".java");
		boolean found = false;

		for(File f: fileList){
			if(f.getName().equals (sym_concat)){
				found = true;
        break;
			}
		}

		if (!found) {
			Template t;

      long[] linenumbers = new long[l.size()];
      int i = 0;
      for (ErrorData ed: l) {
        linenumbers[i++] = ed.lineNumber;
      }

			for (File f: fileList) {
				LevenshteinDistance ld = new LevenshteinDistance();
				int levenshtein_distance = ld.apply (sym_concat, f.getName());

				if (levenshtein_distance == 1) {
          if (l.size() > 1) {
            t = ve.getTemplate ("templates/levenshteinTemplateMulti.vm");
          } else {
            t = ve.getTemplate ("templates/levenshteinTemplate.vm");
          }
					context.put ("symbol", sd.symbol);
					context.put ("line_number", linenumbers);
					context.put ("filename", f.getName());
					context.put ("symconcat", sym_concat);
				} else {
          if (l.size() > 1) {
            t = ve.getTemplate ("templates/missingClassMulti.vm");
          } else {
            t = ve.getTemplate ("templates/missingClass.vm");
          }
					context.put ("symbol", sd.symbol);
					context.put ("lineno", linenumbers);
					context.put ("symconcat", sym_concat);
				}

        StringWriter writer = new StringWriter();
        t.merge (context, writer);

        return "<li>" + writer.toString().replaceAll("\n", "<br/>") + "</li>";
			}
		} else {
      // TODO Say something about imports.
    }

    return "";
	}

}
