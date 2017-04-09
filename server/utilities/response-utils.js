/**
 * Created by adamellis on 07/02/2017.
 */

const NEXUS_BASE_URL = process.env.NEXUS_BASE_URL || 'http://localhost:3000';
const NEXUS_TOOL_CANONICAL_NAME = process.env.NEXUS_TOOL_CANONICAL_NAME || 'peerfeedback';

const request = require('request-promise');

module.exports.sendResponse = function(submission,assignment){
    console.log(submission);
    const promiseArray = [];
    if(assignment && !assignment.additionalConfiguration.contributeFinalMark){
        promiseArray.push(exports.sendMark(100,submission.sid));
    }

    const html =
        `<iframe src="http://localhost:3050/#!/frame/allocation?sid=${submission.sid}&token=${submission.token}" height="500" width="1000"`;
    promiseArray.push(exports.sendFeedback(html,submission.sid));

    return Promise.all(promiseArray);
};


module.exports.sendMark= function(mark, sid){
    const url = `${NEXUS_BASE_URL}/report_mark/${sid}/${NEXUS_TOOL_CANONICAL_NAME}`;
    const body = {
        mark:mark
    };
    return sendRequest(body,url);
};

module.exports.sendFeedback = function (html, sid){
    const url = `${NEXUS_BASE_URL}/report_feedback/${sid}/${NEXUS_TOOL_CANONICAL_NAME}`;
    return sendRequest({body:html},url);
};

function sendRequest(body, url) {
    const requestOptions = {
        url:url,
        method: 'POST',
        headers: {
            'Nexus-Access-Token': 'foo'
        },
        json: true,
        body:body
    };
    return request(requestOptions)
        .then(function(){
        },function(){
            console.log("Already sent feedback");
        })
}
