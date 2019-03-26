#!/bin/bash

echo "Compiling test code and submission"

# Create a temp diretory for the lifespan of the grader execution.
BIN_DIR=$(mktemp -d)


echo "Compiling submission"
export PATH="/usr/bin:/usr/lib:/usr/share/doc:/usr/share/doc/binutils:/usr/include":${PATH}
SUBMISSION_FOLDER="$(find . -name '*.cpp' -exec dirname {} \; | uniq)"
yes|cp -ruv /usr/src/app/bin/Makefile $SUBMISSION_FOLDER #Override Makefile if present else just copy

#Check if the files compile successfully.
if ! (cd $SUBMISSION_FOLDER && make TARGET_DIR=$BIN_DIR/); then
  rm -rf $BIN_DIR
  echo "<p>Failed to compile your submission code.</p>" > $1
  exit 0
fi

UTEST_FOLDER="$(find $test_files -name '*.cpp' -exec dirname {} \; | uniq)" #Get the name of the folder containing the tests.
yes|cp -ruv /usr/src/app/bin/TestRunner.cpp $UTEST_FOLDER
yes|cp -ruv /usr/src/app/bin/Makefile $UTEST_FOLDER
UTEST_FOLDER_PATH="$(realpath $SUBMISSION_FOLDER)"

# Compile test files and the TestRunner into a single executable file.
if ! (cd $UTEST_FOLDER && make unitTestTarget HEADER_FOLDER=$UTEST_FOLDER_PATH TARGET_DIR=$BIN_DIR/); then
  rm -rf $BIN_DIR
  echo "<p>Failed to compile tests against your code. Have you followed all naming conventions and method signatures defined by the assignment?</p>" > $1
  exit 0
fi

echo "Running tests"

# Remove .git files so that running java code cannot simply access them
rm -rf ./.git
rm -rf "$test_files/.git"

MARK_FILE=$(mktemp)
if [ $? -ne 0 ]; then
  rm -rf $BIN_DIR
  rm -f $MARK_FILE
  exit -1
fi

# Execute Tests
# Ensure we timeout after 1 minute
echo "Asked to use timeout of $timeout."
timeout --signal=9 $timeout $BIN_DIR/testrunner $MARK_FILE $1 
RETURN_CODE=$?
echo "Test run resulted in return code $RETURN_CODE"

if [ $RETURN_CODE -ne 0 ]; then
  rm -rf $BIN_DIR
  rm -f $MARK_FILE

  if [ $RETURN_CODE -ne 137 ]; then # Because we use KILL rather than TERM 128+9 indicates timeout
    exit -1
  else
    echo "Your code took too long to execute. Do you have an infinite loop somewhere?" > $1
    exit 0
  fi
fi


echo "Cleaning up"

MARK=$(cat $MARK_FILE)
rm -f $MARK_FILE
rm -rf $BIN_DIR

exit $MARK
