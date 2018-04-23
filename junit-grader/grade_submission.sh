#!/bin/bash

echo "Compiling test code and submission"

BIN_DIR=$(mktemp -d)

SUBMISSION_CLASSPATH=".:$(find . -name '*.jar' | paste -s -d':')"
TEST_CLASSPATH="/usr/src/app/junit-4.12.jar:/usr/src/app/hamcrest-core-1.3.jar:$test_files/:$(find $test_files/ -name '*.jar' | paste -s -d':'):$BIN_DIR:$(find . -name '*.jar' | paste -s -d':')"

echo "Compiling submission"
if ! javac -cp $SUBMISSION_CLASSPATH -d $BIN_DIR $(find . -name '*.java'); then
  rm -rf $BIN_DIR
  echo "<p>Failed to compile your submission code.</p>" > $1
  exit 0
fi

echo "Compiling test cases against submission"
if ! javac -cp $TEST_CLASSPATH -d $BIN_DIR $(find $test_files/ -name '*.java'); then
  rm -rf $BIN_DIR
  echo "<p>Failed to compile tests against your code. Have you followed all naming conventions and method signatures defined by the assignment?</p>" > $1
  exit 0
fi

echo "Running tests"
CLASSPATH="/usr/src/app/bin/:$TEST_CLASSPATH"
export CLASSPATH

MARK_FILE=$(mktemp)
if [ $? -ne 0 ]; then
  rm -rf $BIN_DIR
  rm -f $MARK_FILE
  exit -1
fi

java uk.ac.kcl.inf.nexus.junit_grader.TestRunner $1 $MARK_FILE
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
