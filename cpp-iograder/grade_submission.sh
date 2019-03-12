#!/bin/bash

echo "Starting grading process. This message will go to the log file only."

# Produce HTML feedback
echo "<p>Some feedback</p>" > $1

# Return mark. Values in the range 0-100 will be interpreted as marks, all other values will be interpreted as error markers
exit 57
