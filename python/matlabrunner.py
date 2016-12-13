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

    def __init__( self, function_name, output='', ret=[], ret_names=[], error=None, internal_error=None):
        assert len(ret)==len(ret_names)
        self.function_name = function_name
        self.output = output
        self.ret = ret
        self.ret_names = ret_names
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
        for i in range(0, len(self.ret_names)):
            if self.ret_names[i]==key:
                return self.ret[i].strip()
        raise LookupError("No such item as "+str(key))


class MatlabFunction:
    def __init__( self, function, ret_vals=[], timeout=10):
        self.function = function
        self.ret_vals = ret_vals
        self.timeout = timeout

    def execute(self, dir):
        return _execute(dir, self.function, self.ret_vals, self.timeout)


def _execute( dir, function, ret_vals=[], timeout=10 ):
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
        if len (ret_vals) > 0:
            ret = '[';
            printret = "";
            for i in range(0,len(ret_vals)):
                ret += ret_vals[i]
                if i!=len(ret_vals)-1:
                    ret+=','
                printret+="fprintf('#484 Return value for "+ret_vals[i]+":\\n');\n";
                printret += "disp( "+ret_vals[i] + ");\n";
            ret += '] ='

        args = ['matlab','-automation', '-wait', '-logfile', logfile, '-r',
                """cd('"""+file+"""');
                fprintf('#484 BEGIN EXECUTION\\n');
                try
                    """ + ret + function + """();
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
        ret_pattern = ''
        for r in ret_vals:
            ret_pattern += '#484 Return value for '+r+':\\n(.*)'
        p = re.compile(ret_pattern, re.DOTALL)
        match = p.match( ret )
        if match:
            ret_array = []
            for i in range(0, len(ret_vals)):
                ret_array.append( match.group(i+1))
            return MatlabResult( function, output=output , ret=ret_array,  ret_names=ret_vals )
        else:
            return MatlabResult( function, internal_error="Could not read return values.\n"+ret,)
    else:
        p = re.compile(""".*#484 BEGIN EXECUTION\\n(.*)#484 MATLAB ERROR\\n(.*)""", re.DOTALL);
        match = p.match(full_output)
        if match:
            return MatlabResult( function, output=match.group(1), error=match.group(2))
        else:
            return MatlabResult( function, internal_error="Could not read error or return values.\n"+full_output)
