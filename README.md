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

An explanation of these vars can be found in the main Nexus repo

## Getting Started
- Clone the repo
- Set up your `.env.list` - see above
- Initialise submodules: `git submodule init`
- Fetch all submodules: `git submodule update`
- Build: `docker-compose build`
- Set up database: `docker-compose run nexus rake db:setup` (only needed first time or when schema has changed)
- Run: `docker-compose up`

## References
- https://docs.docker.com/compose/overview/
- https://git-scm.com/book/en/v2/Git-Tools-Submodules
