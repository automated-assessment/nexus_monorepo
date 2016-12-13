function [ret] =question1()
disp('pausing');
total = 0;
for i=1:10
    total= total + i*i;
    fprintf('Step %d, total=%d\n',i, total);
end
ret = total;
end