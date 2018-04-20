#!/bin/bash

echo "Compiling test code and submission"

CLASSPATH="/usr/src/app/junit-4.12.jar;$test_files/;$(find $test_files/ -name '*.jar');.;$(find . -name '*.jar')"
export CLASSPATH

rm -rf ./tmp
mkdir ./tmp
if ! javac -d ./tmp/ $(find $test_files/ -name '*.java') $(find . -name '*.java'); then
   echo "<p>Compilation failed</p>" > $1
   exit 0
fi

exit 100
