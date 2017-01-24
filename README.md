# nexus-deployment
Super-repo (using Git submodules) with a docker-compose config, ready for deployment

## Env variables
A `.env.list` file is expected in the root directory. Here is a template (more details on how to get the values for these variables can be found in the Wiki for `nexus` under the heading "Docker"):

```
NEXUS_GHE_OAUTH_ID=
NEXUS_GHE_OAUTH_SECRET=
NEXUS_GITHUB_USER=
NEXUS_GITHUB_TOKEN=
NEXUS_GITHUB_ORG=
```

For added security it is recommended that you also include a new user name and password for the rabbitmq server. These can be set using the following environment variables, also from `.env.list`:

```
RABBIT_MQ_USER=
RABBITMQ_DEFAULT_USER=
RABBIT_MQ_PWD=
RABBITMQ_DEFAULT_PASS=
```

Note that the two user variables and the two password variables need to be set to the same values. Setting `RABBIT_MQ_HOST` or `RABBIT_MQ_PORT` will break the configuration. You can set `RABBIT_MQ_QNAME` if required.

An explanation of these vars can be found in the main Nexus repo

Additionally, the tools that are included in the docker-compose require their own environment file each. For the RNG tool this is called `.env.rng.list`. For other tools the names are similar, they can be found from `docker-compose.yml` by looking for `env-file` entries. Each file should contain the following variables (as per the documentation in the relevant tool repository):

```
NEXUS_TOOL_CANONICAL_NAME=
NEXUS_ACCESS_TOKEN=
```

The access token must be valid for the nexus instance to be run, so in the first run set it to a random string, then replace it once you have generated an access token in nexus. Restart the docker-compose using `docker-compose restart` once you have updated all .env files.

## Getting Started
- Clone the repo
- Run `make init-env-all`
  - This executes the following
  - Initialise submodules: `git submodule init`
  - Fetch all submodules: `git submodule update`
  - Set up your `.env.list` and other `.env` files - see above

  - You will need to create a personal organistion to store your assignment repositories in development
    - Name it - `NexusDev<YOUR FIRST NAME>`
    - 

- Run `make build` for production
  - Which runs: `docker-compose -f docker-compose.yml build`
  - First time build will take a while


- Run `make build-dev` for development
  - Which runs: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml build`
  - First time build will take a while


- Initialise Nexus with `make init-nexus`
  - Only needed the first time to set up everything.
  - See `Useful Commands` for partial set up commands which handle updates
  - Always takes time


- Run `make run` for production
  - Which runs: `docker-compose up -d`


- Run `make run-dev` for development
  - Which runs: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d`


This brings up the nexus server fully ready to run and detaches it from the current console. You should be able to get to nexus by opening `localhost:3000` in your browser.

## Useful Commands
- To attach into container to see terminal output, useful with Pry debugging
1. Place your `binding.pry` command as normal where required. (Nexus)
2. `make restart-nexus` to update changes in volume.
3. `make debug` to use debugger when triggered.
  3.1  which runs `docker attach nexus_deployment_nexus_1`

- To attach into container with bash terminal, useful for accessing the `Rails Console`
1. run `make bash`
2. The bash terminal will appear, starting you in the `app/src` directory
3. Type `rails c` to gain access to the running rails console.


- To update database after migration
1. run `make migrate-db`


- To reset database run `make init-nexus-db`
  - This will wipe all development records!


- To update JS components when added to or modified run `make init-nexus-js`


### Tools
#### Restart Tools
- Run `make restart`
  - This stops the docker containers and re runs them in production mode


- Run `make restart-dev`
  - This stops the docker containers and re runs them in dev mode


#### Individual Tools
- Run `make restart-nexus`
  - This restarts Nexus in the current environment


- Run `make restart-javac`
  - This restarts the Javac tool in the current environment


- Run `make restart-rng`
  - This restarts the rng tool in the current environment


- Run `make restart-io`
  - This restarts the io tool in the current environment


- Run `make restart-config`
  - This restarts the Config tool in the current environment


- Run `make restart-db`
  - This restarts the DB in the current environment


- Run `make restart-mongodb`
  - This restarts mongodb in the current environment


- Run `make restart-sneakers`
  - This restarts sneakers in the current environment


- Run `make restart-rabbitmq`
  - This restarts rabbitmq in the current environment


- Run `make restart-syslog`
  - This restarts Syslog in the current environment


## Health checks

The rabbitmq console can be found at `http://<hostname>:8081` using the user name and password as defined above.

Logs can be found in `logs/messages`. Use a command like `tail -f logs/messages` to keep on top of them.

The health of all participant micro-services can be found by running `docker-compose ps`.

## References
- https://docs.docker.com/compose/overview/
- https://git-scm.com/book/en/v2/Git-Tools-Submodules
