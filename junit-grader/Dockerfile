FROM abstract-grader

##########################################
# Install Open-JDK (inspired by on official Docker image code)
##########################################

# Set up Open-JDK prerequisites
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
		    bzip2 \
		    unzip \
		    xz-utils && \
    rm -rf /var/lib/apt/lists/*

# On Jessie, OpenJDK is only available as a backport

# Default to UTF-8 file.encoding
ENV LANG C.UTF-8

# do some fancy footwork to create a JAVA_HOME that's cross-architecture-safe
RUN ln -svT "/usr/lib/jvm/java-8-openjdk-$(dpkg --print-architecture)" /docker-java-home
ENV JAVA_HOME /docker-java-home

ENV JAVA_VERSION 8u162
ENV JAVA_DEBIAN_VERSION 8u162-b12-1~deb9u1

# May need to handle certificiates specially, if I run into problems with https at some point
# See official openjdk 8 image for details

RUN echo deb http://http.debian.net/debian jessie-backports main >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y -t jessie-backports openjdk-8-jdk && \
    rm -rf /var/lib/apt/lists/* && \
# update-alternatives so that future installs of other OpenJDK versions don't change /usr/bin/java
    update-alternatives --get-selections | awk -v home="$(readlink -f "$JAVA_HOME")" 'index($3, home) == 1 { $2 = "manual"; print | "update-alternatives --set-selections" }' && \
# ... and verify that it actually worked for one of the alternatives we care about
    update-alternatives --query java | grep -q 'Status: manual'

##########################################
# End Install Open-JDK
##########################################

# We can afford a higher level of concurrency :-)
ENV MAX_CONCURRENCY 10

# Add JUnit -- for now, we're only providing jUnit4, jUnit5 support to be investigated
RUN curl http://search.maven.org/remotecontent?filepath=junit/junit/4.12/junit-4.12.jar > junit-4.12.jar && \
    curl http://search.maven.org/remotecontent?filepath=org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar > hamcrest-core-1.3.jar && \
    chown app:app *.jar

# Bundle app source
COPY --chown=app:app grade_submission.sh /usr/src/app

# Add our custom annotations
ARG CACHEBUST=1
# Anything below here won't be taken from Docker's build cache, ever
RUN mkdir ./bin && \
    git clone git@github.kcl.ac.uk:automated-assessment/junit_annotations.git && \
    javac -d ./bin -cp ./bin:junit-4.12.jar:hamcrest-core-1.3.jar $(find ./junit_annotations/src -name '*.java')

COPY lib lib
RUN javac -d ./bin -cp ./bin:junit-4.12.jar:hamcrest-core-1.3.jar $(find ./lib -name '*.java') && \
    chown -R app:app ./bin
