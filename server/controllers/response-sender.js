/**
 * Created by adamellis on 07/02/2017.
 */

//Borrowed code


const NEXUS_BASE_URL = process.env.NEXUS_BASE_URL || 'http://localhost:3000';
const NEXUS_TOOL_CANONICAL_NAME = process.env.NEXUS_TOOL_CANONICAL_NAME || 'peerfeedback';

const request = require('request');


module.exports.sendResponse = function(req){
    sendMark(100, req.body.sid,function(err,res,body){
    });
    const aid = req.body.aid;
    const studentuid = req.body.studentuid;
    const sid = req.body.sid;
    const html =
        `<iframe src="http://localhost:3050/#!/frame/allocation?sid=${sid}" height="500" width="1000"`;
    sendFeedback(html,req.body.sid,function(err,res,body){
    });
};

        
        



const sendMark= function(n, submissionID, callback){
    const url = NEXUS_BASE_URL + "/report_mark/" + submissionID  + "/" + NEXUS_TOOL_CANONICAL_NAME;
    const body = {
        mark:10
    };

    sendRequest(body,url,callback);
};

const sendFeedback = function (feedbackHTML, submissionID, callback){
    const url = NEXUS_BASE_URL + "/report_feedback/" + submissionID + "/" + NEXUS_TOOL_CANONICAL_NAME;

    sendRequest({body:feedbackHTML},url,callback);
};

function sendRequest(body, url, callback) {

    const requestOptions = {
        url:url,
        method: 'POST',
        headers: {
            'Nexus-Access-Token': 'foo'
        },
        json: true,
        body:body
    };
    request(requestOptions, function(err,res,body){

    });
}

