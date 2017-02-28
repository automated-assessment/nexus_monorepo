/**
 * Created by adamellis on 07/02/2017.
 */

const Submission = require('../datasets/submissionModel');
const allocationProcess = require('./allocation-process');
const responseSender = require('./response-sender');

module.exports.createSubmission = function(req,res){
    console.log("Submission received");
    queryIsNewSubmission(req.body.sid)
       .then(function(isNewSubmission){
           if(isNewSubmission) {
               const submission = req.body;
               allocationProcess.runAllocation(submission);
           }
           responseSender.sendResponse(req);
       });
    res.status(200).send();
};


const queryIsNewSubmission =  function(sid){
    return Submission.findOne({sid:sid})
        .then(function(response){
           return Number(response)===0;
        });
};

