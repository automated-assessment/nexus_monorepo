/**
 * Created by adamellis on 07/02/2017.
 */

//Borrowed code
    //This is a mess. Callback insansity!

const NEXUS_BASE_URL = process.env.NEXUS_BASE_URL || 'http://localhost:3000';
const NEXUS_TOOL_CANONICAL_NAME = process.env.NEXUS_TOOL_CANONICAL_NAME || 'peerfeedback';

const request = require('request-promise');

//TODO: Handle error where neither sendMark nor sendFeedback work, like no assignment

module.exports.sendResponse = function(req,res,next){
    const submission = req.body;

    sendMark(10, submission.sid,res);
    const html =
        `<iframe src="http://localhost:3050/#!/frame/allocation?sid=${submission.sid}&aid=${submission.aid}" height="500" width="1000"`;
    sendFeedback(html,submission.sid,res);


};

const sendMark= function(mark, sid,res){
    const url = `${NEXUS_BASE_URL}/report_mark/${sid}/${NEXUS_TOOL_CANONICAL_NAME}`;
    const body = {
        mark:mark
    };
    return sendRequest(body,url,res);
};

const sendFeedback = function (html, sid,res){
    const url = `${NEXUS_BASE_URL}/report_feedback/${sid}/${NEXUS_TOOL_CANONICAL_NAME}`;
    return sendRequest({body:html},url,res);
};

function sendRequest(body, url,res) {
    const requestOptions = {
        url:url,
        method: 'POST',
        headers: {
            'Nexus-Access-Token': 'foo'
        },
        json: true,
        body:body
    };
    return request(requestOptions);
}

