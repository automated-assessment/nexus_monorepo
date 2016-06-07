import request from 'request';

const NEXUS_BASE_URL = process.env.NEXUS_BASE_URL || 'http://localhost:3000';
const NEXUS_TOOL_CANONICAL_NAME = process.env.NEXUS_TOOL_CANONICAL_NAME || 'javac';

function sendRequest(body, url, callback) {
  const requestOptions = {
    url,
    method: 'POST',
    headers: {
      'Nexus-Access-Token': process.env.NEXUS_ACCESS_TOKEN
    },
    json: true,
    body
  };

  request(requestOptions, callback);
}

export function sendMark(n, submissionID, callback) {
  console.log(`Sending mark of ${n} for submission ${submissionID}...`);
  const url = `${NEXUS_BASE_URL}/report_mark/${submissionID}/${NEXUS_TOOL_CANONICAL_NAME}`;
  const body = { mark: n };

  sendRequest(body, url, callback);
}

export function sendFeedback(feedbackHTML, submissionID, callback) {
  console.log(`Sending feedback for submission ${submissionID}...`);
  const url = `${NEXUS_BASE_URL}/report_feedback/${submissionID}/${NEXUS_TOOL_CANONICAL_NAME}`;

  sendRequest({ body: feedbackHTML }, url, callback);
}
