function [part1, part2] =question2()
total = 0;
for i=1:10
    total= total + i^3;
    fprintf('Step %d, total=%d\n',i, total);
end
part1 = total;
part2 = 100;
end