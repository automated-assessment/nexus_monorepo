## Nexus - Central Management Component
_Full documentation can be found in the [Wiki](https://github.kcl.ac.uk/automated-assessment/nexus/wiki)_
### Tech
- Ruby (2.x)
  - Ruby on Rails (4.2.4)
  - Rubocop
  - RSpec
  - _See `Gemfile` for full list of packages_
- Node.js (4.x)
  - Webpack (1.12) for compiling assets:
    - Sass stylesheets
    - ES6 JavaScript (through Babel)
  - _See `package.json` for full list of packages_
- SQLite as the data back-end for the time being

### Development
#### Requirements
- Ruby 2.x (and `bundler`)
- Node 4.x

#### Environment Variables
##### `NEXUS_GHE_OAUTH_ID` (Requried)
- The ID of an OAuth Application on King's GitHub Enterprise, used for logging in via GitHub.
- Set to something irrelevant such as `000` if just using manual (seeded) logins.

##### `NEXUS_GHE_OAUTH_SECRET` (Requried)
- The Secret of an OAuth Application on King's GitHub Enterprise, used for logging in via GitHub.
- Set to something irrelevant such as `000` if just using manual (seeded) logins.

##### `NEXUS_GITHUB_USER` (Requried)
- Username of the account to authenticate with King's GitHub Enterprise API

##### `NEXUS_GITHUB_TOKEN` (Requried)
- Password (or Personal Access Token) of the account to authenticate with King's GitHub Enterprise API

##### `NEXUS_GITHUB_ORG`
- Name of the organisation to create repos and upload student's submissions to (defaults to `ppa-dev`)

##### `RABBIT_MQ_USER`
- User name for RabbitMQ (defaults to `guest`)

##### `RABBIT_MQ_PWD`
- Password for RabbitMQ (defaults to `guest`)

##### `RABBIT_MQ_HOST`
- Hostname for RabbitMQ server (defaults to `localhost`, for use of docker-based rabbitmq should probably be 172.17.0.2)

##### `RABBIT_MQ_PORT`
- Port for RabbitMQ server (defaults to 5672)

##### `RABBIT_MQ_QNAME`
- Queue name to use on RabbitMQ (defaults to `nexus.submissions_to_tools`)

##### `RAILS_RELATIVE_URL_ROOT`
- If set, Nexus will be hosted at a relative path from the host root, as specified. Useful when running behind a reverse proxy or similar.

##### `NEXUS_BASE_HOST`
- If set, this will be used as the request URI when doing OAuth authorisation requests. Useful when running behind a reverse proxy or similar. This option is only considered in production mode.

#### Quick-start
0. Ensure environment variables are set up (see above) - using a `.env` file is probably best
1. Clone the repo
2. Install Ruby deps: `$ bundle install`
3. Install Node.js deps: `$ npm install`
4. Compile static assets: `$ npm-exec webpack -d`*
5. Set up database: `$ bundle exec rake db:setup`
6. Start RabbitMQ (either directly or via docker)
7. Start sneakers worker: `$ rake sneakers:work` (configuration in `config/sneakers.yml`)
8. Start Nexus: `$ rails server`
9. [http://localhost:3000](http://localhost:3000)
10. Sample admin user details can be found in `db/seeds.rb`
11. To use this account, go to Manual Login, which can be found at `/users/login`


\* `npm-exec` executes the local version of a node module, rather than a globally installed version: `alias npm-exec='PATH=$(npm bin):$PATH'`

#### Linting
1. Ensure Rubocop is installed (`gem install rubocop`)
2. `$ rubocop`

#### Run unit tests
1. Ensure RSpec is installed (`gem install rspec`)
2. `$ rspec`
