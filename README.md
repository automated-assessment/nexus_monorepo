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
**1. Clone the repo and cd into it**
  1. `git clone https://github.kcl.ac.uk/k1464330/nexus-deployment.git`
  2. `cd <pathToRepo>/nexus-deployment`

**2. Run `make init-env-all`. This executes the following:**
  1. Initialise submodules: `git submodule init`
  2. Fetch all submodules: `git submodule update`

**3 Create an Organisation**
  This keeps any repos created in development seperate from those created in production during actual use.
  1. ![New Organisation](https://i.imgur.com/vUv2Gx1.png)
  2. Give it the name `NexusDev<First Name>` where `<First Name>` is your first name
  3. Set the email to be your university email `kXXXXXXX@kcl.ac.uk` or `name.surname@kcl.ac.uk`

**4. Create and configure an OAuth Developer Application**
  1. Go to your profile settings
  2. ![Profile Settings](https://i.imgur.com/fwZmnHo.png)
  5. Click `OAuth Applications` in the sidebar
  6. Click the `Developer Applications` tab near the top of the page
  7. Click `Register a new Application`
  8. Set the following field values
  ![OAuth Settings](https://i.imgur.com/5ombZSI.png)
  9. Application Name: `nexus`
  10. Homepage URL: `http://localhost:3000/`
  11. Authorization Callback URL: `http://localhost:3000/users/auth/github/callback`
  12. ... and then save it
  13. You will be given a `Client ID` and a `Client Secret` unique to this application. Do not share these!
  14. In your `.env.list` file. Set `NEXUS_GITHUB_ORG` to be equal to the name you gave to your organisation.
  15. In your `.env.list` file. Set `NEXUS_GHE_OAUTH_ID` to be equal to the Client ID you were given.
  16. In your `.env.list` file. Set `NEXUS_GHE_OAUTH_SECRET` to be equal to the Client Secret you were given.

**5. Create a Personal Access Token**
  1. Go to your profile settings as in step 4
  2. Click `Personal Access Tokens` in the side bar
  3. Click `Generate a New Token`
  4. Give the Token a valid descriptor that makes sense to you. `i.e. Nexus`
  5. Set the following permissions
  6. ![PA Token Permissions](https://i.imgur.com/O4FsyJc.png)
  7. Click `Generate Token`
  8. **This will produce a token that will never be shown again. If you lose this token, you will need to repeat this step! Do not share this token with anyone!!!**
  9. In your `.env.list` file. Set `NEXUS_GITHUB_USER` to be your `k number` with a lower case `k`
  10. In your `.env.list` file. Set `NEXUS_GITHUB_TOKEN` to be your `Personal Access Token` github generated for you.
  11. Make sure you save the `.env.list` file.

**If you are building Nexus for production, go to Step 5 and skip Step 6.**

**If you are doing a BSc or MSc final project, skip Step 5 and go to Step 6.**

**5. Run `make build` for production only**
  - Which runs: `docker-compose -f docker-compose.yml build`
  - First time build will take a while


**6. Run `make build-dev` for development only**
  - Which runs: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml build`
  - First time build will take a while


**7 Initialise Nexus with `make init-nexus`**
  - Only needed the first time to set up everything.
  - See `Useful Commands` for partial set up commands which handle updates
  - Always takes time


**8. Run `make run` for production only**
  - Which runs: `docker-compose up -d`


**9. Run `make run-dev` for development only**
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
