import request from 'request';

const NEXUS_BASE_URL = process.env.NEXUS_BASE_URL || 'http://localhost:3000';
const NEXUS_SUB_DIR = process.env.NEXUS_SUB_DIR || '';
const NEXUS_TOOL_CANONICAL_NAME = process.env.NEXUS_TOOL_CANONICAL_NAME || 'generic';

function sendRequest(body, url_end, callback) {
  const url = `${NEXUS_BASE_URL}${NEXUS_SUB_DIR}${url_end}`;
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
  const url = `/report_mark/${submissionID}/${NEXUS_TOOL_CANONICAL_NAME}`;
  const body = { mark: n };

  sendRequest(body, url, callback);
}

export function sendFeedback(feedbackHTML, submissionID, callback) {
  console.log(`Sending feedback for submission ${submissionID}...`);
  const url = `/report_feedback/${submissionID}/${NEXUS_TOOL_CANONICAL_NAME}`;

  sendRequest({ body: feedbackHTML }, url, callback);
}
