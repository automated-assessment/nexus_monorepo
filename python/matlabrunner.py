import subprocess
import os
import tempfile
import re
import psutil


def _kill(proc_pid):
    """Kill a process and all child processes"""
    p = psutil.Process(proc_pid)
    for proc in p.children(recursive=True):
        proc.kill()
    p.kill()


class MatlabResult:
    """Stores the result of executing a matlab function"""

    def __init__( self, function_name, output='', ret=[], error=None, internal_error=None):
        self.function_name = function_name
        self.ret = ret
        self.output = output
        self.error = error
        self.internal_error = internal_error

    def __str__(self):
        if self.internal_error:
            return "MATLAB execution failed due to an error in the server code. Diagnostic information below:\n"+self.internal_error
        if self.error:
            return "MATLAB execution failed due to a problem with student code. Diagnostic information below:\n"+self.error+"\nMATLAB output:\n"+self.output
        else:
            return "Return values:\n"+str(self.ret)+"\nMATLAB output:\n"+self.output

    def __getitem__(self,key):
        return self.ret[key].strip()


class MatlabFunction:
    def __init__( self, function, timeout=10):
        self.function = function
        self.timeout = timeout

    def execute(self, dir):
        return _execute(dir, self.function, self.timeout)


def _execute( dir, function, timeout=10 ):
    """Executes a Matlab function in the given directory"""

    file = os.path.realpath( dir)
    file = file.replace('\\','\\\\')
    (handle,logfile) = tempfile.mkstemp()
    os.close(handle)

    process = None
    timeout_occurred = False

    try:
        ret = ''
        printret = ''

        args = ['/usr/local/bin/matlab','-automation', '-wait', '-logfile', logfile, '-r',
                """cd('"""+file+"""');
                fprintf('#484 BEGIN EXECUTION\\n');
                try
                    functionHandle = @"""+function+""";
                    N=nargout(functionHandle);
                    [out{1:N}]=functionHandle();
                    for j=1:N
                        fprintf('#484 Return value %d\\n',j);
                        disp( out{j} );
                        fprintf('#484 End return value\\n');
                    end
                    fprintf('#484 END EXECUTION\\n');
                    """ + printret + """
                    exit(0);
                catch ME
                    disp('#484 MATLAB ERROR');
                    fprintf('Error ID %s\\n', ME.identifier);
                    disp(ME.message);
                    exit(1);
                end
                exit(1);"""]
        process = subprocess.Popen(args)
        process.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        timeout_occurred = True
        _kill(process.pid)
    finally:
        with open(logfile) as f:
            full_output = f.read()
        try:
            os.remove(logfile)
        except Exception:
            print('Failed to delete temporary file')

    if timeout_occurred:
        p = re.compile(""".*#484 BEGIN EXECUTION\\n(.*)""", re.DOTALL);
        m = p.match(full_output)
        if m:
            output = m.group(1)
        else:
            output = full_output
        return MatlabResult(function, output=output, error='MATLAB timed out. Time limit is '+str(timeout)+" seconds.")

    p = re.compile(""".*#484 BEGIN EXECUTION\\n(.*)#484 END EXECUTION\\n(.*)""", re.DOTALL);
    match = p.match(full_output)
    if match:
        output=match.group(1)
        ret = match.group(2)
        ret_pattern = '#484 Return value [\d]+\\n(.*?)#484 End return value\\n'
        matches = re.findall(ret_pattern, output, re.DOTALL);
        output = re.sub(ret_pattern,'',output,0,re.DOTALL);
        ret_values = [];
        for match in matches:
            ret_values.append(match.strip());
        return MatlabResult( function, output=output , ret=ret_values )
    else:
        p = re.compile(""".*#484 BEGIN EXECUTION\\n(.*)#484 MATLAB ERROR\\n(.*)""", re.DOTALL);
        match = p.match(full_output)
        if match:
            return MatlabResult( function, output=match.group(1), error=match.group(2))
        else:
            return MatlabResult( function, internal_error="Could not read error or return values.\n"+full_output)
