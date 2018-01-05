# These expect you to define some local information:
# - your matlab installation on the Docker host, perhaps `/usr/local/MATLAB/R2016a`. Mount this volume as per below.
# - optional path on the Docker host to receive Matlab logs, perhaps `~/matlab-logs`. Not currently supported.
# - MAC address associated with your own Matlab License, of the form `00:00:00:00:00:00`. Spoof this when creating the Docker
#    container.
#
# Inspired by https://github.com/benjamin-heasly/matlab-support/blob/master/Dockerfile
#
FROM node

# Matlab dependencies
RUN apt-get update && \
    apt-get install -y \
      libpng12-dev \
			libfreetype6-dev \
			libblas-dev \
			liblapack-dev \
			gfortran \
			build-essential
# Not installing xorg as this doesn't work well and isn't needed (we're planning on running Matlab in headless mode)

# Python3 and relevant packages
RUN apt-get install -y python3 python3-pip && \
    pip3 install nose && \
    pip3 install psutil

# Map host's validated matlab installation to this volume
VOLUME  /usr/local/MATLAB/from-host
ENV PATH="/usr/local/MATLAB/from-host/bin:${PATH}"

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Define submissions directory
ENV SUBMISSIONS_DIRECTORY=/mnt/submissions/

COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD ["start"]
