FROM node:4

# Volume with test specifications
VOLUME /test-specs

# Volume where repos will be created. To be shared with Git Server
VOLUME /repositories

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

CMD [ "npm", "start" ]
