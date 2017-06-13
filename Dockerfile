FROM node:4

RUN mkdir /src
WORKDIR /src

COPY package.json /src
RUN npm install --production --silent

COPY . /src

EXPOSE 3050

CMD ["npm", "start"]
