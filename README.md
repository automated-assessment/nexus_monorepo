## RNG marking tool for Nexus
Designed as a minimal example of a Tool to receive requests, and send a mark+feedback over the defined interfaces

### Environment Variables
- `NEXUS_ACCESS_TOKEN`: valid access token registered with Nexus **(required)**
- `NEXUS_BASE_URL`: the base URL (without trailing `/`) of Nexus  _(default: `http://localhost:3000`)_
- `NEXUS_TOOL_CANONICAL_NAME`: the canonical (unique) name that Nexus associates with this tool _(default: `rng`)_
- `PORT`: _(default: `5000`)_

### Endpoints

#### `POST /mark`
- Scores between 0 and 100 inclusively

Required parameters:
- `sid`: Submission ID
