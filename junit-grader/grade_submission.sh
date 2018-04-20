#!/bin/bash

echo "Compiling test code and submission"

CLASSPATH="/usr/src/app/junit-4.12.jar:/usr/src/app/hamcrest-core-1.3.jar:$test_files/:$(find $test_files/ -name '*.jar' | paste -s -d':'):.:$(find . -name '*.jar' | paste -s -d':')"
export CLASSPATH

rm -rf ./tmp
mkdir ./tmp
if ! javac -d ./tmp/ $(find $test_files/ -name '*.java') $(find . -name '*.java'); then
   echo "<p>Compilation failed</p>" > $1
   exit 0
fi

CLASSPATH="/usr/src/app/bin/:/usr/src/app/junit-4.12.jar:/usr/src/app/hamcrest-core-1.3.jar:$(find $test_files/ -name '*.jar' | paste -s -d':'):./tmp/:$(find . -name '*.jar' | paste -s -d':')"
export CLASSPATH

java uk.ac.kcl.inf.nexus.junit_grader.TestRunner $1 ./.tmp.mark

exit $(cat ./.tmp.mark)
