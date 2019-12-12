#!/bin/bash

echo "Compiling submission"

# Create a temp directory for the lifespan of the grader execution.
BIN_DIR=$(mktemp -d)

TEST_CLASSPATH="/usr/src/app/bin/:$BIN_DIR:$(find . -name '*.jar' | paste -s -d':')"
export PATH="/usr/bin:/usr/lib:/usr/share/doc:/usr/share/doc/binutils":${PATH}
SUBMISSION_FOLDER="$(find . -name '*.cpp' -exec dirname {} \; | uniq)"
yes|cp -ruv /usr/src/app/Makefile $SUBMISSION_FOLDER #Override Makefile if present else just copy

# Check submission for successful compilation
if ! (cd $SUBMISSION_FOLDER && make TARGET_DIR=$BIN_DIR/); then
  rm -rf $BIN_DIR
  echo "<p>Failed to compile your submission code.</p>" > $1
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

FILE_DIR="$BIN_DIR"
CLASSPATH="$TEST_CLASSPATH"
export CLASSPATH
export FILE_DIR
java -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap uk.ac.kcl.inf.nexus.io_grader.TestRunner $test_files/IO_specification.tests $1 $MARK_FILE $timeout
if [ $? -ne 0 ]; then
  rm -rf $BIN_DIR
  rm -f $MARK_FILE
  exit -1
fi

echo "Cleaning up"

MARK=$(cat $MARK_FILE)
rm -f $MARK_FILE
rm -rf $BIN_DIR

exit $MARK
