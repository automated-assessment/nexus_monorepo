#!/bin/bash

# Remove .git files so that running java code cannot simply access them
rm -rf ./.git

echo "Running compilation code"

BIN_DIR=$(mktemp -d)

SUBMISSION_CLASSPATH="$(find . -name '*.jar' | paste -s -d':')"


MARK_FILE=$(mktemp)
if [ $? -ne 0 ]; then
  rm -rf $BIN_DIR
  rm -f $MARK_FILE
  exit -1
fi


java -cp "$(find /usr/src/app/bin -name '*.jar' | paste -s -d':'):/usr/src/app/bin/:$SUBMISSION_CLASSPATH" -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap uk.ac.kcl.inf.nexus.javac_grader.CompileSubmission $1 $MARK_FILE
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
