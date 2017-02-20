
//is this possible? - perhaps if one student submits many times
//how to deal? - inform student that they can only submit so many times to fix this?

const Submission = require('../datasets/submissionModel');
const responseController = require('./response-controller');
const allocationProcess = require('./allocation-process');

module.exports.createSubmission = function(req,res){


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

