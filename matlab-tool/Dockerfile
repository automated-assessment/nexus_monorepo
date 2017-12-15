# Plan:
#
# 3. Add separate docker-compose files to be included when matlab flag is set and figure out how to configure matlab location for these
# 4. Document usage in various README files
# 5. Change server code to call python using python shell (optional)
#
#
# These expect you to define some local information:
# - `MATLAB_ROOT` is your matlab installation on the Docker host, perhaps `/usr/local/MATLAB/R2016a`. Mount this volume as per below.
# - `MATLAB_LOGS` is optional path on the Docker host to receive Matlab logs, perhaps `~/matlab-logs`. Not currently supported.
# - `MATLAB_MAC_ADDRESS` is the MAC address associated with your own Matlab License, of the form `00:00:00:00:00:00`. Spoof this when creating the Docker
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
			build-essential \
			xorg

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

CMD [ "npm", "start" ]
