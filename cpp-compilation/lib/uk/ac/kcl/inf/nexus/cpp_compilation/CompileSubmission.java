package uk.ac.kcl.inf.nexus.cpp_compilation;

import java.io.*;

import java.util.*;

import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.runtime.*;

/**
 * Entry point for compiling C++ files.
 */
public class CompileSubmission {
    public static void main(String[] args) {

        new CompileSubmission().CompileCppProgram().reportMark(args[1]).reportFeedback(args[0]);
        System.out.println("Done");
    }

    private StringWriter swOutput = new StringWriter();

    private List<File> files = null;

    public CompileSubmission() {
        files = getFiles();
    }

    private CompileSubmission CompileCppProgram() {
                

       for (File f : files) {
            try {
                String command[] = {"g++", "-c", "-std=c++11", "-O", f.getName()};
                String envp[] = {"PATH=/usr/bin:/usr/lib:/usr/share/doc:/usr/share/doc/binutils:/usr/local/bin:/usr/local/sbin:/usr/sbin:/bin:/sbin:."};
                Process p = Runtime.getRuntime().exec(command,envp,f.getParentFile());
                

                BufferedReader in2 = new BufferedReader(new InputStreamReader(p.getErrorStream()));
                String line2 = null;
                while ((line2 = in2.readLine()) != null) {
                    swOutput.append(line2 +"\n");
                }
                

            } catch (IOException e) {
                e.printStackTrace();
                System.out.println("EXCEPTION");
            }
       }

        return this;
    }

    private CompileSubmission reportMark(String fileName) {
        int mark = 0;

        if (swOutput.toString().isEmpty()) {
            mark = 100;
        } else {
            mark = 0;
        }

        try {
            writeToFile(fileName, Integer.toString(mark));
        } catch (IOException ioe) {
            System.err.println("Exception writing mark file: " + ioe);
        }

        return this;
    }

    private CompileSubmission reportFeedback(String fileName) {
        boolean allOK = swOutput.toString().isEmpty();
        StringBuffer sb = new StringBuffer();

        StringBuffer sbGccOutput = new StringBuffer();

        VelocityEngine ve = new VelocityEngine();
        ve.setProperty(RuntimeConstants.RESOURCE_LOADER, "file");
        ve.setProperty(RuntimeConstants.FILE_RESOURCE_LOADER_PATH, "/usr/src/app/bin");
        ve.init();

        VelocityContext context = new VelocityContext();

        if (!allOK) {
            // First, show feedback directly from compiler. This should probably
            // go into a separate tab
            sbGccOutput.append("<p>Compiler error messages.</p>");
            sbGccOutput.append("<pre>");
            if (!swOutput.toString().isEmpty()) {
                sbGccOutput.append(swOutput.toString());
            }
            sbGccOutput.append("</pre>");

        }
            String[] fileNames = new String[files.size()];
            int i = 0;
            for (File f : files) {
                fileNames[i++] = f.getName();
            }
            Template t = ve.getTemplate("templates/output.vm");
            context.put("allOK", allOK);
            context.put("gccOutput", sbGccOutput.toString());
            context.put("files", fileNames);
            StringWriter writer = new StringWriter();
            t.merge(context, writer);
            sb.append(writer.toString());
            //System.out.println("Will produce the following feedback: \n" + writer.toString() + "\n");

            try {
                writeToFile(fileName, sb.toString());
            } catch (IOException ioe) {
                System.err.println("Exception writing feedback file: " + ioe);
            }
        
        return this;
    }

    private List<File> getFiles() {
        return getFiles(new File("."));
    }

    private List<File> getFiles(File dir) {
        List<File> result = new ArrayList<>();

        for (File f : dir.listFiles()) {
            if (f.isFile()) {
                if (f.getName().endsWith(".cpp")) {
                    result.add(f);
                }
            } else if (f.isDirectory()) {
                result.addAll(getFiles(f));
            }
        }

        return result;
    }

    private void writeToFile(String fileName, String data) throws IOException {
        BufferedWriter out = new BufferedWriter(new FileWriter(fileName));
        out.write(data);
        out.close();
    }
}