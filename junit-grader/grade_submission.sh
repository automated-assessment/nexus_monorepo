#!/bin/bash

echo "Compiling test code and submission"

BIN_DIR=$(mktemp -d)

SUBMISSION_CLASSPATH="$(find . -name '*.jar' | paste -s -d':')"
TEST_CLASSPATH="/usr/src/app/bin/:/usr/src/app/junit-4.12.jar:/usr/src/app/hamcrest-core-1.3.jar:$(find $test_files/ -name '*.jar' | paste -s -d':'):$BIN_DIR:$(find . -name '*.jar' | paste -s -d':')"

echo "Compiling submission"
if ! javac -cp "$SUBMISSION_CLASSPATH" -d $BIN_DIR $(find . -name '*.java'); then
  rm -rf $BIN_DIR
  echo "<p>Failed to compile your submission code.</p>" > $1
  exit 0
fi

echo "Compiling test cases against submission"
if ! javac -cp "$TEST_CLASSPATH" -d $BIN_DIR $(find $test_files/ -name '*.java'); then
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

# Ensure we timeout after 1 minute
# Note that a better alternative is for teachers to set the timeout option when adding the @Test annotation
timeout --signal=9 1m java -cp "$TEST_CLASSPATH" -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap uk.ac.kcl.inf.nexus.junit_grader.TestRunner $1 $MARK_FILE
RETURN_CODE=$?
echo "Test run resulted in return code $RETURN_CODE"
if [ $RETURN_CODE -ne 0 ]; then
  rm -rf $BIN_DIR
  rm -f $MARK_FILE

  if [ $RETURN_CODE -ne 137 ]; then # man pages seem to be wrong about this exit code...
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
