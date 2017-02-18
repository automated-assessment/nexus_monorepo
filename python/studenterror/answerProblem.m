function [part1, part2] =answerProblem()
disp('pausing');
total = 0;
for i=1:10
    total= total + i*i;
    fprintf('Step %d, total=%d\n',i, total);
end
part1 = total;
part2 = total;
end