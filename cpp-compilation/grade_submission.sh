#!/bin/bash

# Remove .git files so that running code cannot simply access them
rm -rf ./.git

echo "Running compilation code"

# Create temp directory for the lifespan on the grader execution.
BIN_DIR=$(mktemp -d)

SUBMISSION_CLASSPATH="$(find . -name '*.jar' | paste -s -d':')"


MARK_FILE=$(mktemp)
if [ $? -ne 0 ]; then
  rm -rf $BIN_DIR
  rm -f $MARK_FILE
  exit -1
fi

# Compile submission
/usr/local/openjdk-11/bin/java -cp "$(find /usr/src/app/bin -name '*.jar' | paste -s -d':'):/usr/src/app/bin/:$SUBMISSION_CLASSPATH" -XX:+UnlockExperimentalVMOptions -XX:+UseContainerSupport uk.ac.kcl.inf.nexus.cpp_compilation.CompileSubmission $1 $MARK_FILE
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
