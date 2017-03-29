function testIntegrateMonteCarlo()

rng('default');

function ret = integrand(x)
   ret = x*x;
end

val = integrateMonteCarlo(@integrand,0,1);
assert (abs(val-0.33)<0.01);

end