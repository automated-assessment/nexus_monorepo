FROM node:9.11

# grab gosu for easy step-down from root
RUN gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates wget && rm -rf /var/lib/apt/lists/* \
	&& wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/1.2/gosu-$(dpkg --print-architecture)" \
	&& wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/1.2/gosu-$(dpkg --print-architecture).asc" \
	&& gpg --verify /usr/local/bin/gosu.asc \
	&& rm /usr/local/bin/gosu.asc \
	&& chmod +x /usr/local/bin/gosu \
	&& apt-get purge -y --auto-remove ca-certificates wget

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Create app user. This user will be used to step down to when running the grade script
RUN groupadd -r app && useradd -rmg app app

# Install app dependencies
COPY package.json .
RUN npm install

# Install config page dependencies
COPY configPage/package.json configPage/
RUN cd configPage && \
    npm install

# Generate SSH key for use when pulling additional repositories and store GHE key in known_hosts
RUN ssh-keygen -q -t rsa -b 4096 -C "git repos" -N "" -f /root/.ssh/id_rsa && \
    ssh-keyscan -H -t rsa github.kcl.ac.uk > /root/.ssh/known_hosts

ARG GHE_USER
ENV GHE_USER=$GHE_USER

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
