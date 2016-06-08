## Nexus - Central Management Component
_Full documentation can be found in the [Wiki](https://github.kcl.ac.uk/sam/nexus/wiki)_
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

#### Quick-start
1. Clone the repo
2. Install Ruby deps: `$ bundle install`
3. Install Node.js deps: `$ npm install`
4. Compile static assets: `$ npm-exec webpack -d`*
5. Set up database: `$ bundle exec rake db:setup`
6. Start Nexus: `$ rails server`
7. [http://localhost:3000](http://localhost:3000)
8. Sample user details can be found in `db/seeds.rb`


\* `npm-exec` executes the local version of a node module, rather than a globally installed version: `alias npm-exec='PATH=$(npm bin):$PATH'`

#### Linting
1. Ensure Rubocop is installed (`gem install rubocop`)
2. `$ rubocop`

#### Run unit tests
1. Ensure RSpec is installed (`gem install rspec`)
2. `$ rspec`
