import html
import argparse
from matlabrunner import MatlabFunction

def escapeHTML( s ):
    return html.escape(s,quote=True)


def _summarize_as_html_helper( ret, diagnostics=True):
    """Create an table showing all the function calls"""
    summary = []
    summary.append("<table>\n")
    for i in range(0, len(ret)):
        result = ret[i]
        f = result.function_name
        summary.append("<tr>")
        summary.append("<td>Question")
        summary.append(str(i+1))
        summary.append(":</td>")
        summary.append("<td colspan='2'>Called function ")
        summary.append(escapeHTML(f) + "()")
        summary.append("</td>")
        summary.append("</tr>\n")
        if result.internal_error:
            summary.append("<tr><td></td><td></td><td class='error'>");
            summary.append("Server error. Please retry and if the problem persists report a bug.\n");
            summary.append("</td></tr>\n")
        elif result.error:
            summary.append("<tr><td></td><td></td><td class='error'>Student error. ")
            summary.append(escapeHTML(result.error) + "</td></tr>\n")
        else:
            summary.append("<tr><td></td><td colspan='2'>Return values:</td></tr>\n")
            ret_values = result.ret
            for j in range(0, len(ret_values)):
                summary.append("<tr>")
                summary.append("<td></td>")
                summary.append("<td>Return value " + str(j+1) + "=</td>")
                summary.append("<td>" + str(ret_values[j]) + "</td>")
                summary.append("</tr>\n")
        if diagnostics:
            if result.internal_error:
                summary.append("<tr><td></td><td></td><td>Diagnostics</td></tr>")
            else:
                summary.append("<tr><td></td><td></td><td>MATLAB Output</td></tr>")
            summary.append("<tr><td></td><td></td><td><pre>")
            if result.internal_error:
                summary.append( result.internal_error )
            else:
                summary.append( result.output )
            summary.append("</pre></td></tr>")
    summary.append("</table>\n")
    summary = "".join(summary)
    return summary

def summarize_as_html( ret):
    """Create an HTML summary of all the function calls"""
    error_occurred = False
    internal_error_occurred = False
    for i in range(0, len(ret)):
        error_occurred = error_occurred or ret[i].error
        internal_error_occurred = internal_error_occurred or ret[i].internal_error

    summary = ["<style>.error {color: red; font-weight: bold; }</style>",
               "<h2>Summary</h2>\n", \
               _summarize_as_html_helper(ret, diagnostics=False), \
               "<h2>Full MATLAB output</h2>\n", \
               _summarize_as_html_helper(ret, diagnostics=True)]
    return error_occurred, internal_error_occurred, "".join(summary)


def run_functions( functions, dir ):
    """Runs the given functions using the code in the given directory. Returns True if all went well, together with a string for the user"""
    res = []
    for i in range(0, len(functions)):
        res.append(functions[i].execute(dir))
    return summarize_as_html(res)


def run( functions, dir='.', description='Run student questions.' ):
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument('--dir', default=dir,
                        help='Directory containing student code.')
    parser.add_argument('--out', default=None,
                        help='Where to write the feedback report.')

    args = parser.parse_args()

    error_occurred, internal_error, summary = run_functions(functions, args.dir)
    print( summary )
    out = args.out;
    if out:
        try:
            with open(out, "w") as f:
                f.write(summary)
        except Exception:
            internal_error=True
    if error_occurred:
        return exit(0)
    if internal_error:
        return exit(-1)
    else:
        return exit(100)
