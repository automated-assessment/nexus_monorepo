function val = integrateMonteCarlo( f, a, b )

N = 1000000;

total = 0;
xVals = a + (b-a)*rand(1,N);
for  x=xVals
    total = total + f(x);
end

val = (b-a)/N * total;

end
