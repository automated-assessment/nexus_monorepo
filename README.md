## Nexus - Configurable RNG Marking Tool
_A detailed explanation of the code can be found in the main Nexus repo's [Wiki](https://github.kcl.ac.uk/sam/nexus/wiki)_

Designed as a minimal example of a Tool to receive requests, and send a mark+feedback over the defined interfaces, **and also provide configuration**

This is the same as the RNG marking tool, except:
- Each assignment has its own minimum and maximum bounds within which the random mark is generated.
- This is configured through a html/javascript webpage, provided at a certain http endpoint

### Tech
- Node.js (4.x)
  - Express (4.x)
  - React.js for the config page
  - Written in ES6 using Babel with `stage-0` proposals enabled
  - _See `package.json` for full list of packages_

### Development
#### Requirements
- Node 4.x

#### Quick-start
1. Clone the repo
2. Install Node.js deps: `$ npm install`
3. Compile the configuration page: `$ cd configPage && webpack`
4. Start the tool: `$ NEXUS_ACCESS_TOKEN=foo npm start`

As a minimum, `NEXUS_ACCESS_TOKEN` is required, although other environment variables are available:

#### Environment Variables
- `NEXUS_ACCESS_TOKEN`: valid access token registered with Nexus **(required)**
- `NEXUS_BASE_URL`: the base URL (without trailing `/`) of Nexus  _(default: `http://localhost:3000`)_
- `NEXUS_TOOL_CANONICAL_NAME`: the canonical (unique) name that Nexus associates with this tool _(default: `rng`)_
- `PORT`: _(default: `5001`)_

#### Linting
- ESLint is configured (for server code only, not for React component _yet_)

### HTTP Endpoints

##### `POST /mark`
- The dispatch inferface. Requires `sid` and `aid`.

##### `POST /config`
- Updates the configuration for a given assignment. Requires `aid`, `min` and `max`.

##### `GET /static/config.html?aid=x`
- Displays the configuration page for assignment `x`
