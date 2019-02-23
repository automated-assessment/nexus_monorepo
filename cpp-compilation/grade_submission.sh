#!/bin/bash

#Remove .git files for simplicity
rm -rf ./.git



echo "Starting grading process. This message will go to the log file only."

BIN_DIR = $(mktemp -d)

SUBMISSION_CLASSPATH = "$(find . -name '*.cpp')"

MARK_FILE = $(mktemp)
if [ $? -ne 0 ]; then
	rm -rf $BIN_DIR
	rm -f $MARK_FILE
	exit -1
fi

#make -f /usr/src/app/cppsubmission/Makefile:$SUBMISSION_CLASSPATH $1 $MARK_FILE
make -C $SUBMISSION_CLASSPATH/Makefile $1 $MARK_FILE
if [ $? -ne 0 ]; then
	rm -rf $BIN_DIR
	rm -f $MARK_FILE
	exit -1
fi

echo "Clean up"

MARK = $(cat $MARK_FILE)
rm -f $MARK_FILE
rm -rf $BIN_DIR

exit $MARK

# Mark student code found in the current working directory.

# Produce HTML feedback
echo "<p>Some more specialised feedback</p>" > $1
# Alternatively, use the code below to access stuff from the test_files repository
# echo "<p>Some more specialised feedback</p><pre>" > $1
# cat `echo $test_files`/README.md >> $1
# echo "</p" >> $1

# Return mark. Values in the range 0-100 will be interpreted as marks, all other values will be interpreted as error markers
#exit $MARK
