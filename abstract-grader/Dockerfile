FROM node

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
RUN npm install

# Install config page dependencies
COPY configPage/package.json configPage/
RUN cd configPage && \
    npm install

# Generate SSH key for use when pulling additional repositories and store GHE key in known_hosts
# FIXME: This isn't currently working: GHE deploy keys can only be used for a single repo... 
RUN ssh-keygen -q -t rsa -b 4096 -C "git repos" -N "" -f /root/.ssh/id_rsa && \
    ssh-keyscan -H -t rsa github.kcl.ac.uk > /root/.ssh/known_hosts

# Bundle app source
COPY . .
RUN cd configPage/src/js && \
    mkdir components

# Define submissions directory
ENV SUBMISSIONS_DIRECTORY=/mnt/submissions/

COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD ["start"]

# Compile config page react components from sub-image provided information
ONBUILD COPY config_schema.yml config_schema.yml
ONBUILD RUN node generate_config_page.js && \
            rm -rf generate_config_page.js && \
            rm -rf _generate_config_page.js && \
            cd configPage && npm run build
