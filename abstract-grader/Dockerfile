FROM node

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Install config page dependencies
COPY configPage/package.json /usr/src/app/configPage/
RUN cd configPage && npm install

# Bundle app source
COPY . /usr/src/app

# Define submissions directory
ENV SUBMISSIONS_DIRECTORY=/mnt/submissions/

COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD ["start"]

# Compile config page react components
ONBUILD RUN node generate_config_page.js
ONBUILD RUN rm -rf generate_config_page.js
ONBUILD RUN cd configPage && npm run build
