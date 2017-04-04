/**
 * Created by adamellis on 03/03/2017.
 */

const Submission = require('../datasets/submissionModel');
const allocationUtils = require('./../utilities/allocation-utils');
const responseUtils = require('./../utilities/response-utils');
const crypto = require('crypto');


module.exports.getAllSubmissions = function(req,res){

    Submission.find()
        .then(function(response){
           res.send(response);
        });
};

module.exports.getOneSubmission = function(req,res){

    const query = {
        sid:req.params.sid
    };

    Submission.findOne(query)
        .then(function(response){
            res.send(response);
        })
};

module.exports.getAssignmentSubmissions = function(req,res){

    const query = {
        aid:req.params.aid
    };

    Submission.find(query)
        .then(function(response){
            res.send(response);
        })
};

module.exports.getGitData = function(sid){

    const query = {
        sid:sid
    };

    const projection = {
        sha:1,
        branch:1,
        cloneurl:1
    };

    //TODO: Use this to pass in the repo
    return Submission.findOne(query,projection)
        .then(function(response){
            return response;
        })
};

//TODO: Remove duplication of SHA and branch from submissions and allocations
module.exports.createSubmission = function(req,res,next){
    checkPreExisting(req.body.sid)
        .then(function(preExistingSubmission){
            if(!preExistingSubmission) {
                queryAssignment(submission)
                    .then()
                const submission = new Submission(req.body);
                submission.dateCreated = new Date();
                submission.submissionHash = crypto.randomBytes(20).toString('hex');

                submission.save(function(response){
                    allocationUtils.runAllocation(submission);
                });

            } else {
                console.log("Error: submission exists");
            }
            responseUtils.sendResponse(req,res,next);
        });
    res.status(200).send("Successful");
};




const checkPreExisting =  function(sid){
    return Submission.findOne({sid:sid})
        .then(function(response){
           return response;
        })
};



