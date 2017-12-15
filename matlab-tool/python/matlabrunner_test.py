from matlabrunner import *

from nose.tools import *
import nose;
import sys;


def test_noreturn():
    f = MatlabFunction('noreturn')
    res = f.execute( 'matlabtestfunctions' )
    assert_equal('This function returns nothing',res.output.strip())


def test_singlereturn():
    f = MatlabFunction('singlereturn')
    res = f.execute( 'matlabtestfunctions' )
    assert_equal('This function returns one value\nAnd prints two lines',res.output.strip());
    assert_equal(res[0],"100");


def test_doublereturn():
    f = MatlabFunction('doublereturn')
    res = f.execute( 'matlabtestfunctions' )
    assert_equal('This function returns two values\nAnd prints two lines',res.output.strip());
    assert_equal(res[0],"100");
    assert_equal(res[1], "200");


def test_nofunction():
    f = MatlabFunction('nofunction')
    res = f.execute( 'matlabtestfunctions' )
    assert_equal(res.error.strip(), "Error ID MATLAB:narginout:functionDoesnotExist\nFunction nofunction does not exist.")


def test_timeout():
    f = MatlabFunction('timeout', timeout=1)
    res = f.execute( 'matlabtestfunctions' )
    assert_equal(res.error, 'MATLAB timed out. Time limit is 1 seconds.')

if __name__ == '__main__':
    #This code will run the test in this file.'

    module_name = sys.modules[__name__].__file__

    result = nose.run(argv=[sys.argv[0],
                            module_name,
                            '--nocapture',
                            '-v'])