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
- Initialise submodules: `git submodule init`
- Fetch all submodules: `git submodule update`
- Set up your `.env.list` and other `.env` files - see above
- Build: `docker-compose build`
- Initialise: `docker-compose run nexus init` (only needed first time, when schema has changed, or when javascript component have been added or modified; partial initialisations `init-js`, `init-dirs`, and `init-db` are also available)
- Run: `docker-compose up -d`

This brings up the nexus server fully ready to run and detaches it from the current console. 

## Health checks

The rabbitmq console can be found at `http://<hostname>:8081` using the user name and password as defined above. 

Logs can be found in `logs/messages`. Use a command like `tail -f logs/messages` to keep on top of them.

The health of all participant micro-services can be found by running `docker-compose ps`.

## References
- https://docs.docker.com/compose/overview/
- https://git-scm.com/book/en/v2/Git-Tools-Submodules
