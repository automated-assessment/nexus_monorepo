from matlabassessor import *
from matlabrunner import MatlabResult
from nose.tools import *
import os

def write_to_file( file, text ):
    with open(file, "w") as f:
        f.write(text)


def test_summarise_as_html():
    r1 = MatlabResult('fName','Line1\nLine2',ret=['ret1','ret2'])
    r2 = MatlabResult('fName', 'Exception details', error='An exception was thrown')
    r3 = MatlabResult('fName', 'Internal error details', internal_error='An internal error occurred')
    error, internal_error, summary = summarize_as_html([r1,r2, r3])
    assert error
    assert internal_error
    write_to_file('matlabassessor_test1.html', "<!DOCTYPE html>\n<html><body>"+summary+"</body></html>")
    assert_equal("""<style>.error {color: red; font-weight: bold; }</style><h2>Summary</h2>
<table>
<tr><td>Question1:</td><td colspan='2'>Called function fName()</td></tr>
<tr><td></td><td colspan='2'>Return values:</td></tr>
<tr><td></td><td>Return value 1=</td><td>ret1</td></tr>
<tr><td></td><td>Return value 2=</td><td>ret2</td></tr>
<tr><td>Question2:</td><td colspan='2'>Called function fName()</td></tr>
<tr><td></td><td></td><td class='error'>Student error. An exception was thrown</td></tr>
<tr><td>Question3:</td><td colspan='2'>Called function fName()</td></tr>
<tr><td></td><td></td><td class='error'>Server error. Please retry and if the problem persists report a bug.
</td></tr>
</table>
<h2>Full MATLAB output</h2>
<table>
<tr><td>Question1:</td><td colspan='2'>Called function fName()</td></tr>
<tr><td></td><td colspan='2'>Return values:</td></tr>
<tr><td></td><td>Return value 1=</td><td>ret1</td></tr>
<tr><td></td><td>Return value 2=</td><td>ret2</td></tr>
<tr><td></td><td></td><td>MATLAB Output</td></tr><tr><td></td><td></td><td><pre>Line1
Line2</pre></td></tr><tr><td>Question2:</td><td colspan='2'>Called function fName()</td></tr>
<tr><td></td><td></td><td class='error'>Student error. An exception was thrown</td></tr>
<tr><td></td><td></td><td>MATLAB Output</td></tr><tr><td></td><td></td><td><pre>Exception details</pre></td></tr><tr><td>Question3:</td><td colspan='2'>Called function fName()</td></tr>
<tr><td></td><td></td><td class='error'>Server error. Please retry and if the problem persists report a bug.
</td></tr>
<tr><td></td><td></td><td>Diagnostics</td></tr><tr><td></td><td></td><td><pre>An internal error occurred</pre></td></tr></table>
""", summary)


def test_studentexample():
    exit_code = os.system('python fm06assessor.py --dir studentexample')
    print( str(exit_code) )
    assert exit_code==100

def test_studenterror():
    exit_code = os.system('python fm06assessor.py --dir studenterror --out matlabassessor_test2.html')
    with open('matlabassessor_test2.html') as f:
        output = f.read();
    assert_equals(output.strip(),"""<style>.error {color: red; font-weight: bold; }</style><h2>Summary</h2>
<table>
<tr><td>Question1:</td><td colspan='2'>Called function testall()</td></tr>
<tr><td></td><td></td><td class='error'>Student error. Error ID MATLAB:narginout:functionDoesnotExist
Function testall does not exist.
</td></tr>
<tr><td>Question2:</td><td colspan='2'>Called function answerProblem()</td></tr>
<tr><td></td><td colspan='2'>Return values:</td></tr>
<tr><td></td><td>Return value 1=</td><td>385</td></tr>
<tr><td></td><td>Return value 2=</td><td>385</td></tr>
</table>
<h2>Full MATLAB output</h2>
<table>
<tr><td>Question1:</td><td colspan='2'>Called function testall()</td></tr>
<tr><td></td><td></td><td class='error'>Student error. Error ID MATLAB:narginout:functionDoesnotExist
Function testall does not exist.
</td></tr>
<tr><td></td><td></td><td>MATLAB Output</td></tr><tr><td></td><td></td><td><pre></pre></td></tr><tr><td>Question2:</td><td colspan='2'>Called function answerProblem()</td></tr>
<tr><td></td><td colspan='2'>Return values:</td></tr>
<tr><td></td><td>Return value 1=</td><td>385</td></tr>
<tr><td></td><td>Return value 2=</td><td>385</td></tr>
<tr><td></td><td></td><td>MATLAB Output</td></tr><tr><td></td><td></td><td><pre>pausing
Step 1, total=1
Step 2, total=5
Step 3, total=14
Step 4, total=30
Step 5, total=55
Step 6, total=91
Step 7, total=140
Step 8, total=204
Step 9, total=285
Step 10, total=385
</pre></td></tr></table>""");
    assert exit_code==0
