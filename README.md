# Peer Feedback Marker
The tool was developed using MongoDB, express.js, AngularJS and Node.js.

If running outside a Docker compose swarm, make sure a file `.env.peerfeedback.list`
is in the current directory with the following variables set:

```
DB_HOST=localhost
NEXUS_TOOL_CANONICAL_NAME=peerfeedback
NEXUS_ACCESS_TOKEN=foo
ACADEMIC_TOKEN=foo
```

Note: DB_HOST may need to be updated if running with Docker.

## Running within the Automated Assessment Docker Swarm
To run this within the Docker Swarm, follow the instructions in the README  [here](https://github.kcl.ac.uk/automated-assessment/nexus-deployment).
It is much easier to run it in this way as all the dependencies are dealt with already.

If you do not want to run within the Docker Swarm, please follow the instructions below.

## Run Locally
To run peer feedback locally, you will need to have [node.js](https://nodejs.org/en/)
installed and [MongoDB](https://www.mongodb.com/) installed and running a local
instance on your machine.

Assuming this is the case, run the following commands:
```
npm install
npm run-script start // For production use or
npm run-script startdev // For development
```
If running for development, we use nodemon to automatically restart the node server
when any changes are made to the code.

## Run with Docker
All that is required here is that [Docker](https://www.docker.com/) is installed
on your machine and running.

Two seperate Dockerfiles have been defined, one for production and one for developement.

For development, we mount the `/src` directory as a volume so the code directory
on the local machine can be mounted to the `/src` directory inside the container and `nodemon` will automatically restart the server when changes are detected.
Note the use of `VOLUME /src`

Dockerfile-dev
```
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
RUN npm install --silent
VOLUME /src

CMD ["start-dev"]
```

For production, do not allow for the source code to be mounted. Code in production
should not be changed on the fly. Note the absence of `VOLUME /src`

Dockerfile
```
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
```
To build the image for production, run `docker build -t peer-feedback .`.
`-t (--tag)` gives the image a name to refer to later.
This is sufficient as the default place to look for the Docker file is `./Dockerfile`

To build the image for development run `docker build -f ./Dockerfile.dev -t peer-feedback .`.
By using the `-f (--file)` flag, we can specify the location to the docker file.

To run the container (a running image instance), an instance of a MongoDB, either locally
or through Docker, will also need to be running, as peer feedback depends on using MongoDB as the data store.
Trying to run `peer-feedback` without a mongo instance running, that it can access, will result in a
`MongoError` being thrown.
Node doesn't need to be running in Docker because the peerfeedback image is based on node.

To run any of the images above, run `docker run peer-feedback` or if you want to mount the code
directory to the volume for development only, run `docker run -v ${pwd}:/src .` to mount
the current directory on the local machine to the `/src` directory in the container.
We use `pwd` since the directory must be absolute, not relative.
