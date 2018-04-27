# Nexus -- Automated Assessment of Student Submissions
Monorepo for Nexus. This contains the code for all services, including the central management component and all graders etc. Each service is kept in its own folder under the main folder. The main folder only contains files needed to run the integration (`docker-compose` files etc) as well as a global `Makefile`.

Below, you will find documentation on how to get started with Nexus from this repository as well as the environment variables that need defining.

You will also find information about how to develop your own contributions to Nexus.

## Getting Started
**1. Clone the repo and cd into it**
  1. `git clone https://github.kcl.ac.uk/automated-assessment/nexus_monorepo.git`
  2. `cd <pathToRepo>/nexus_monorepo`

**2. Run `make init-env`. This executes the following:**
  1. Creates, if they don't exist, and populates relevant `.env` files needed to run. The `.env` files will be initialised with default values, which you may need to customise (see next steps and general documentation at the end of this document).

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

**6. Run `make abstract-rsa`**
  1. This builds the [abstract-grader](abstract-grader/README.md) image and extracts the public RSA key from it.
  2. Copy this key. It appears at the very end of the output and looks something like this (this is not an actual key):

  ```
  ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCdoZ3SMnSBjFhcHkkcwZItVo6JmrmX3so/4JWSVX1rKzg2yb5Lx6um5y9O2Sr+rRAUc9uMAN/d04KP3S3zHUoOz7pZrDxhHY9IMnNtJsK/QqQX0vUtSjYf9naQsXarzD6M1/DMEbaAK/6jfS4ROtnFXz1zfME+2vvJl0QOjUZR9q2kDIvJYOj/9JuGbz5K4TxJHeaM3tK75qGzej+b1QWkEi39xpkv0ccxPEKvfLYzPSNnNhHYEz4PM0LFYNv8aRvUe8mYXCB5JjhMCxnhkb87FXi6gIJhtYKNduiiArWad+qw5D10gKlnu5Xrl11CCqKtOuljd8hhO7diyxCb1klX2alyE54KFg8/2PCjCe9X5lDbAe5T28Nu0T898WE7boY5GQsMQTFkXE95CdQrY2ipRYIuz84RZo5remaimYndAhJ0ZH7zyHBvIHTd+YfqUxQ3rTbmQ9xnPAeEDcm30Xm/bivwkKEgFr708ou/t25+Rsc5Ah0J8OhqG0JJzPSjE7sI5FsXykIzenw/pj1Jz+IkZ/OG930Urh9k8xNLUzwd+sv6KpGdfk7130pEfekHGcoQEPPUG4QZEyTL6uFpFGhYDSlRJO9OYMj2dqdNgs1nKXGDX37RdkOsqQjOV1/DD1nG88vWqUIgEkwXYQbnWouLzFANppocKywR2mAsNHi/7w== git repos
  ```

  3. Create a new SSH key for the user you used in step 5 (usually your k-number on Github Enterprise). To do so:
    1. Go to your profile settings as above.
    2. Click on `SSH and GPG keys` in the side bar.
    3. Click `New SSH key`.
    4. Give the new key a name and copy the public RSA key into the key field.
    5. Click `Add SSH key` to add the key.
  4. Make sure that this user has read access to the [jUnit annotation repository](https://github.kcl.ac.uk/automated-assessment/junit_annotations). Talk to Steffen, if you haven't got access to this repository for some reason.

**7. Run `make build`**
  - Which runs: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml build`
  - First time build will take a while, go get a coffee

**8. Initialise Nexus with `make init-nexus`**
  - Only needed the first time to set up everything.
  - See `Useful Commands` for partial set up commands which handle updates
  - Always takes time

**9. Run `make run`**
  - Which runs: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d`
  - This brings up the nexus server fully ready to run and detaches it from the current console. You should be able to get to nexus by opening `localhost:3000` in your browser.

## For *production* usage...

Nexus can be run in development or production mode. By default, you will run in development mode. This gives you more detailed logs and some other nice features, but is not good for production. If you want to get a feel for what production would be like, run `make production` and then go back to step 6 above. The main difference is that `docker-compose` will now be run only with the main config file. To switch back to development mode, run `make development` (or `make dev` for short).

## Useful Commands

- To attach into container to see terminal output, useful with Pry debugging
  1. Place your `binding.pry` command as normal where required. (Nexus)
  2. `make restart-nexus` to update changes in volume.
  3. `make debug` to use debugger when triggered.
    1.  which runs `docker attach nexus_deployment_nexus_1`

- To attach into container with bash terminal, useful for accessing the `Rails Console`
  1. run `make bash`
  2. The bash terminal will appear, starting you in the `app/src` directory
  3. Type `rails c` to gain access to the running rails console.

- To update database after migration
  1. run `make migrate-db`

- To reset database run `make init-nexus-db`
  - This will wipe all development records!

- To update JS components when added to or modified run `make init-nexus-js`

### Graders
#### Restart Graders
- Run `make restart`
  - This stops the docker containers and re runs them in your current build mode
- Run `make restart-service service=<service-name>`
  - This restarts only the named service in your current build mode

### Test graders

Run `make test-graders` to run grader tests. More information can be found in the [grader-testing documentation](grader_tester/README.md). Nexus needs to be down for this to run correctly. You should also only run this in a separate workspace from your dev workspace, as graders may be modifying their databases as part of the test runs.

Run `make test-nexus` to run rspec tests on the core management component. These tests aren't yet complete, so contributions are always welcome. At the end of this, nexus will be down!

### Adding graders

To add a new grader, you need to provide a Dockerfile for it and mention it in a number of places: the various `docker-compose.graders.*.yml` files need to be updated. The grader also needs to be mentioned in the dependencies for `nexus` in [`docker-compose.yml`](docker-compose.yml) as well as the dependencies of `grader-tester` in [`docker-compose.tests.yml`](docker-compose.test.yml) (at least if you want to be able to run black-box tests against it). See also [DOCKER-COMPOSE-FILES](DOCKER-COMPOSE-FILES.md).

If your grader is to be implemented in JavaScript or as a shell script, you may be able to benfit from the [abstract grader stub implementation](abstract-grader/README.md). This provides everything required for communication with Nexus and GHE, allowing you to focus on the key grading functionality.

## Health checks

The rabbitmq console can be found at `http://<hostname>:8081` using the user name and password as defined below.

Logs can be found in `logs/messages`. Use a command like `tail -f logs/messages` to keep on top of them.

The health of all participant micro-services can be found by running `make ps`.

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

Additionally, the graders that are included in the docker-compose require their own environment file each. For the RNG grader this is called `.env.rng.list`. For other graders the names are similar, they can be found from `docker-compose.yml` by looking for `env-file` entries. Each file should contain the following variables (as per the documentation in the relevant grader repository):

```
NEXUS_TOOL_CANONICAL_NAME=
NEXUS_ACCESS_TOKEN=
```

The access token must be valid for the nexus instance to be run, so in the first run set it to a random string, then replace it once you have generated an access token in nexus. Restart the docker-compose using `docker-compose restart` once you have updated all .env files.

## Contributing

To contribute your own code to Nexus, make a fork of the repository. When your contribution is ready, submit a pull request against a suitable `contribution/XYZ` branch. This will be reviewed and you may get feedback that you will be asked to integrate into your contribution. Once it is ready, Steffen will merge into the `contribution/XYZ` branch and from there eventually into `master`. Anything that is merged into `master` will end up in production. Only Steffen can merge into master.

You should consider opening a pull request into `contribution/XYZ` as soon as you have made the first commit into your own branch. This way, we will have an easy way of checking your contribution as it develops over time and you can receive feedback on your code as you create it. You are free to use your own branching protocol below your branch or fork (and are indeed encouraged to use branches extensively there.). Please talk to Steffen for a `contribution/XYZ` branch to be set up.

## References
- https://docs.docker.com/compose/overview/
