from matlabrunner import *

from nose.tools import *


def test_noreturn():
    f = MatlabFunction('noreturn')
    res = f.execute( 'matlabtestfunctions' )
    assert_equal('This function returns nothing',res.output.strip())


def test_singlereturn():
    f = MatlabFunction('singlereturn', ret_vals=['r1'])
    res = f.execute( 'matlabtestfunctions' )
    assert_equal('This function returns one value\nAnd prints two lines',res.output.strip());
    assert_equal(res['r1'],"100");


def test_doublereturn():
    f = MatlabFunction('doublereturn', ret_vals=['r1','r2'])
    res = f.execute( 'matlabtestfunctions' )
    assert_equal('This function returns two values\nAnd prints two lines',res.output.strip());
    assert_equal(res['r1'],"100");
    assert_equal(res['r2'], "200");


def test_nofunction():
    f = MatlabFunction('nofunction')
    res = f.execute( 'matlabtestfunctions' )
    assert_equal(res.error.strip(), "Error ID MATLAB:UndefinedFunction\nUndefined function or variable 'nofunction'.")


def test_timeout():
    f = MatlabFunction('timeout', timeout=1)
    res = f.execute( 'matlabtestfunctions' )
    assert_equal(res.error, 'MATLAB timed out. Time limit is 1 seconds.')
