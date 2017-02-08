/**
 * Created by adamellis on 07/02/2017.
 */


var NEXUS_BASE_URL = process.env.NEXUS_BASE_URL || 'http://localhost:3000';
var NEXUS_TOOL_CANONICAL_NAME = process.env.NEXUS_TOOL_CANONICAL_NAME || 'peerfeedback';

var request = require('request');

module.exports.sendMark = function(n, submissionID, callback){
    var url = NEXUS_BASE_URL + "/report_mark/" + submissionID  + "/" + NEXUS_TOOL_CANONICAL_NAME;
    const body = {
        mark:10
    };

    sendRequest(body,url,callback);
}

module.exports.sendFeedback = function (feedbackHTML, submissionID, callback){
    var url = NEXUS_BASE_URL + "/report_feedback/" + submissionID + "/" + NEXUS_TOOL_CANONICAL_NAME;
    sendRequest({body:feedbackHTML},url,callback);
}

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