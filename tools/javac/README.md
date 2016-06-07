## `javac` marking tool

### Environment Variables
- `NEXUS_ACCESS_TOKEN`: valid access token registered with Nexus **(required)**
- `SUBMISSIONS_DIRECTORY`: path to the directory where submissions can be accessed **(required)**
- `NEXUS_BASE_URL`: the base URL (without trailing `/`) of Nexus  _(default: `http://localhost:3000`)_
- `NEXUS_TOOL_CANONICAL_NAME`: the canonical (unique) name that Nexus associates with this tool _(default: `javac-0`)_
- `PORT`: _(default: `5000`)_

### Endpoints

#### `POST /mark_javac`
- Looks for all `.java` files (recursively) to compile
- Looks in `../../var/submissions/code/${submissionID}`*
- Scores `100` if compiles without errors, `0` otherwise
- `javac` command will time out after 60 seconds.

Required parameters:
- `sid`: Submission ID

### Docker Quick-start

#### Build
`docker build -t nexus-javac-tool .`

#### Run
`docker run -e "NEXUS_ACCESS_TOKEN=foo SUBMISSIONS_DIRECTORY=/mnt/submissions" -p 5000:5000 nexus-javac-tool`

_(see above for additional environment vars)_
