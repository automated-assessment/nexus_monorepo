FROM node:4

RUN mkdir /src
WORKDIR /src

COPY package.json /src
<<<<<<< HEAD
=======
RUN npm install --production --silent
>>>>>>> 0f0ffc6ec8c2d7292e0810547e342d2ce03dd2fb

COPY . /src

EXPOSE 3050

<<<<<<< HEAD
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Start of instructions not common to both Dockerfile and Dockerfile.dev
# This is to make use of caching
RUN npm install --production --silent
CMD ["start"]
=======
CMD ["npm", "start"]
>>>>>>> 0f0ffc6ec8c2d7292e0810547e342d2ce03dd2fb
