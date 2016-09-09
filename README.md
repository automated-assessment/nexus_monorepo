# nexus-deployment
Super-repo (using Git submodules) with a docker-compose config, ready for deployment

## Env variables
A `.env.list` file is expected in the root directory. Here is a template:

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

## Getting Started
- Clone the repo
- Set up your `.env.list` - see above
- Initialise submodules: `git submodule init`
- Fetch all submodules: `git submodule update`
- Build: `docker-compose build`
- Initialise: `docker-compose run nexus init` (only needed first time, when schema has changed, or when javascript component have been added or modified)
- Run: `docker-compose up`

This brings up the nexus server fully ready to run. The rabbitmq console can be found at `http://<hostname>:8081` using the user name and password as defined above.

## References
- https://docs.docker.com/compose/overview/
- https://git-scm.com/book/en/v2/Git-Tools-Submodules
