## Nexus - RNG Marking Tool
_A detailed explanation of the code can be found in the main Nexus repo's [Wiki](https://github.kcl.ac.uk/sam/nexus/wiki)_

Designed as a minimal example of a Tool to receive requests, and send a mark+feedback over the defined interfaces

### Tech
- Node.js (4.x)
  - Express (4.x)
  - Written in ES6 using Babel with `stage-0` proposals enabled
  - _See `package.json` for full list of packages_

### Development
#### Requirements
- Node 4.x

#### Quick-start
1. Clone the repo
2. Install Node.js deps: `$ npm install`
3. Start the tool: `$ NEXUS_ACCESS_TOKEN=foo npm start`

As a minimum, `NEXUS_ACCESS_TOKEN` is required, although other environment variables are available:

#### Environment Variables
- `NEXUS_ACCESS_TOKEN`: valid access token registered with Nexus **(required)**
- `NEXUS_BASE_URL`: the base URL (without trailing `/`) of Nexus  _(default: `http://localhost:3000`)_
- `NEXUS_TOOL_CANONICAL_NAME`: the canonical (unique) name that Nexus associates with this tool _(default: `rng`)_
- `PORT`: _(default: `5001`)_

#### HTTP Endpoints
##### `POST /mark`
- Waits for a few seconds (to simulate the behaviour of a 'real' tool doing work)
- Generates a random mark [0, 100]
- Sends that mark back to the CMC
- Sends a basic Boostrap progress bar reflecting the mark as feedback to the CMC

Required query parameters:
- `sid`: Submission ID

Returns:
- `200 OK`
- `400 Bad Request` if the submission ID is missing or NaN

Example:

```
$ http POST localhost:5001/mark?sid=222                                   
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 2
Content-Type: text/plain; charset=utf-8
Date: Wed, 08 Jun 2016 15:51:10 GMT
ETag: W/"2-4KoCHiHd29bYzs7HHpz1ZA"
X-Powered-By: Express

OK
```
