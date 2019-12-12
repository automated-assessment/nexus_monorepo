# Generate UI from configuration file
FROM abstract-grader AS core-grader

# Install java and set up the grader
FROM abstract-grader:core

##########################################
# Install Open-JDK (inspired by on official Docker image code)
# Taken from IO-Grader
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

# Bundle app source
COPY --from=core-grader --chown=app:app /usr/src/app /usr/src/app
COPY --chown=app:app grade_submission.sh /usr/src/app


COPY Makefile Makefile
COPY lib lib
RUN mkdir ./bin && \
    javac -d ./bin -cp ./bin $(find ./lib -name '*.java') && \
    chown -R app:app ./bin