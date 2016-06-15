## Nexus - `javac` Marking Tool
_A detailed explanation of the code can be found in the main Nexus repo's [Wiki](https://github.kcl.ac.uk/automated-assessment/nexus/wiki)_

Takes a submission and attempts to compile all `.java` files found. Scores 0 for errors, 100 otherwise; and returns console output as feedback.

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
3. Start the tool: `$ NEXUS_ACCESS_TOKEN=foo SUBMISSIONS_DIRECTORY="/mnt/submissions/" npm start`

As a minimum, `NEXUS_ACCESS_TOKEN` and `SUBMISSIONS_DIRECTORY` are required, although other environment variables are available:

#### Environment Variables
- `NEXUS_ACCESS_TOKEN`: valid access token registered with Nexus **(required)**
- `SUBMISSIONS_DIRECTORY`: path (relative or absolute) to the directory where (extracted) submissions can be accessed **(required)**
- `NEXUS_BASE_URL`: the base URL (without trailing `/`) of Nexus  _(default: `http://localhost:3000`)_
- `NEXUS_TOOL_CANONICAL_NAME`: the canonical (unique) name that Nexus associates with this tool _(default: `javac`)_
- `PORT`: _(default: `5000`)_

#### Linting
- ESLint is configured

### HTTP Endpoints
##### `POST /mark`
- Looks (recursively) for all `.java` files in the submission's directory
- Builds a `sources.txt` file with all files found
- Executes `javac -Xlint:all @sources.txt`
- The command will time out (and raise an error) after 60 seconds.
- Scores `0` if errors are raised; `100` otherwise.
- `.java` files found and console output are returned as feedback

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
