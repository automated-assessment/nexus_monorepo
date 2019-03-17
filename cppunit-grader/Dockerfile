# Generate UI from configuration file
FROM abstract-grader AS core-grader

# Install java and set up the grader
FROM abstract-grader:core


# Install and configure CPPUnit libraries and dependencies.
RUN apt-get update && \
    #apt-get upgrade -y && \
    apt-get install -y software-properties-common && \
    apt-get update && \
    apt-get install -y ca-certificates wget  build-essential \
    libboost-all-dev  libcppunit-dev  \
    && rm -rf /var/lib/apt/lists/*



# We can afford a higher level of concurrency :-)
ENV MAX_CONCURRENCY 10


# Bundle app source
COPY --from=core-grader --chown=app:app /usr/src/app /usr/src/app
COPY --chown=app:app grade_submission.sh /usr/src/app


COPY Makefile Makefile
COPY TestRunner.cpp TestRunner.cpp
RUN mkdir ./bin && \
    cp Makefile ./bin && cp TestRunner.cpp ./bin 
