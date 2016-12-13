import matlabassessor
from matlabrunner import MatlabFunction


toRun = [ MatlabFunction("testall"),
          MatlabFunction("question1", ["ret"]),
          MatlabFunction("question2", ["part1","part2"])]

output = matlabassessor.run(toRun, dir='studentexample')
