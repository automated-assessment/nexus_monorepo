/**
 * Created by adamellis on 07/02/2017.
 */

const Submission = require('../datasets/submissionModel');
const responseController = require('./response-controller');
const allocationProcess = require('./allocation-process');

module.exports.createSubmission = function(req,res){
    console.log("working");
    queryIsNewSubmission(req.body.sid)
       .then(function(isNewSubmission){
           if(isNewSubmission){
               const submission = new Submission(req.body);
               allocationProcess.runAllocation(submission);
           }
           responseController.response(req);
       });
    res.status(200).send();
};


const queryIsNewSubmission =  function(sid){
    return Submission.find({sid:sid}).limit(1)
        .then(function(response){
           return Number(response)===0;
        });
};

