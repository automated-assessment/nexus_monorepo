import request from 'request';

const NEXUS_BASE_URL = process.env.NEXUS_BASE_URL || 'http://localhost:3000';
const NEXUS_SUB_DIR = process.env.NEXUS_SUB_DIR || '';
const NEXUS_TOOL_CANONICAL_NAME = process.env.NEXUS_TOOL_CANONICAL_NAME;

const UAT_URL = process.env.UAT_URL || 'http://unique-assignment-tool:3009';
const UAT_TOKEN = process.env.UAT_ACCESS_TOKEN;
if (!UAT_TOKEN) {
  console.log('Error: Specify UAT_ACCESS_TOKEN in environment');
  process.exit(1);
}

export function sendMark(n, submissionID, callback) {
  console.log(`Sending mark of ${n} for submission ${submissionID}...`);
  const url = `/report_mark/${submissionID}/${NEXUS_TOOL_CANONICAL_NAME}`;
  const body = { mark: n };

  sendNexusRequest(body, url, callback);
}

export function sendFeedback(feedbackHTML, submissionID, callback) {
  console.log(`Sending feedback for submission ${submissionID}...`);
  const url = `/report_feedback/${submissionID}/${NEXUS_TOOL_CANONICAL_NAME}`;

  sendNexusRequest({ body: feedbackHTML }, url, callback);
}

export function sendUniquificationRequest(assignmentID, studentID, files, callback) {
  const requestBody = {
    sid: studentID,
    aid: assignmentID,
    templates: files
  };

  const requestOptions = {
    url: `${UAT_URL}/grader_gen`,
    method: 'POST',
    headers: {
      'nexus-access-token': process.env.UAT_ACCESS_TOKEN
    },
    json: true,
    body: requestBody
  };

  request(resquestOptions, callback);
}

function sendNexusRequest(body, url_end, callback) {
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
