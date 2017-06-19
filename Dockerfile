FROM node:8

RUN mkdir /src
WORKDIR /src

COPY package.json /src

COPY . /src

EXPOSE 3050

COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Start of instructions not common to both Dockerfile and Dockerfile.dev
# This is to make use of caching
RUN npm install --production --silent

CMD ["start"]
