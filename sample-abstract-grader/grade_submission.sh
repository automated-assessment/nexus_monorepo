#!/bin/bash
echo "Starting grading process. This message will go to the log file only."

# Mark student code found in the current working directory.

# Produce HTML feedback
echo "<p>Some more specialised feedback</p>" > $1
# Alternatively, use the code below to access stuff from the test_files repository
# echo "<p>Some more specialised feedback</p><pre>" > $1
# cat `echo $test_files`/README.md >> $1
# echo "</p" >> $1

# Return mark. Values in the range 0-100 will be interpreted as marks, all other values will be interpreted as error markers
exit 97
