import matlabassessor
from matlabrunner import MatlabFunction


toRun = [ MatlabFunction("testall", timeout=60),
          MatlabFunction("question1", ["ret"], timeout=60),
          MatlabFunction("question2", ["part1","part2"], timeout=60)]

output = matlabassessor.run(toRun, dir='studentexample')
