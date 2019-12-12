import matlabassessor
from matlabrunner import MatlabFunction


toRun = [ MatlabFunction("testall", timeout=120),
          MatlabFunction("answerProblem", timeout=300)]

output = matlabassessor.run(toRun, dir='studentexample')
