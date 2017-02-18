import matlabassessor
from matlabrunner import MatlabFunction


toRun = [ MatlabFunction("testall", timeout=60),
          MatlabFunction("answerProblem", timeout=60)]

output = matlabassessor.run(toRun, dir='studentexample')
