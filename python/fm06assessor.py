import matlabassessor
from matlabrunner import MatlabFunction


toRun = [ MatlabFunction("testall", timeout=300),
          MatlabFunction("answerProblem", timeout=300)]

output = matlabassessor.run(toRun, dir='studentexample')
