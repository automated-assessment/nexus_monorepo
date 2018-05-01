#!/bin/bash

echo "Compiling submission"

BIN_DIR=$(mktemp -d)

SUBMISSION_CLASSPATH="$(find . -name '*.jar' | paste -s -d':')"
TEST_CLASSPATH="/usr/src/app/bin/:$BIN_DIR:$(find . -name '*.jar' | paste -s -d':')"

echo "Compiling submission"
if ! javac -cp "$SUBMISSION_CLASSPATH" -d $BIN_DIR $(find . -name '*.java'); then
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

CLASSPATH="$TEST_CLASSPATH"
export CLASSPATH
java -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap uk.ac.kcl.inf.nexus.io_grader.TestRunner $test_files/IO_specification.tests $1 $MARK_FILE
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
