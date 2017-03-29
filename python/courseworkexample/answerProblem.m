function [part1,part2] =answerProblem()

function ret = integrand1(x)
   ret = cos(x);
end
part1 = integrateMonteCarlo(@integrand1,0,pi/2);

function ret = integrand2(x)
   ret = exp(x);
end
part2 = integrateMonteCarlo(@integrand2,0,1);

end