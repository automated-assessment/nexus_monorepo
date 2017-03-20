/**
 * Created by adamellis on 03/03/2017.
 */

const Submission = require('../datasets/submissionModel');
const allocationUtils = require('./allocation-utils');
const responseSender = require('./response-sender');
const crypto = require('crypto');
const request = require('request-promise');
const unzip = require('unzip');


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


module.exports.getSubmissionCore = function(req,res){

    const query = {
        sid:req.params.sid
    };

    const projection = {
        providers:0
    };

    Submission.find(query,projection)
        .then(function(response){
            res.send(response);
        })
};


module.exports.getSubmissionProviders = function(req,res){

    const query = {
        sid:req.params.receiversid
    };


    Submission.findOne(query)
        .then(function(response){
            res.send(response);
        })
};

module.exports.getSubmissionReceivers = function(req,res){

    Submission.aggregate(

        {
            $unwind:"$providers"
        },
        {
            $match:{
                "providers.providersid":Number(req.params.providersid)
            }
        },
        {
            $addFields:{
                "root":{
                    "sid":"$providers.providersid",
                    "student":"$providers.student",
                    "studentemail":"$providers.studentemail",
                },
                "tempreceivers":{
                    "receiversid":"$sid",
                    "student":"$student",
                    "alias":"$providers.alias",
                    "studentemail":"$studentemail",
                    "currentForm":"$providers.currentForm",
                    "provided":"$providers.provided",
                    "dateCreated":"$dateCreated"
                }
            }
        },
        {
            $group:{
                _id:Math.random(),
                "providersid":{$addToSet:"$root.sid"},
                "student":{$addToSet:"$root.student"},
                "studentemail":{$addToSet:"$root.studentemail"},
                "receivers":{$addToSet:"$tempreceivers"},
                "dateCreated":{$addToSet:"$dateCreated"}
            },
        },
        {$unwind:'$providersid'},{$unwind:'$student'},{$unwind:'$studentemail'}


    )
        .then(function(response){
            if(response){
                response = response[0];
            }
            res.send(response);

        });

};




module.exports.getGitData = function(req,res){

    const query = {
        sid:req.params.sid
    };

    const projection = {
        sha:1,
        branch:1
    };

    Submission.findOne(query,projection)
        .then(function(response){
            res.send(response);
        })
};

//TODO: Remove duplication of SHA and branch from submissions and allocations
module.exports.createSubmission = function(req,res){
    console.log(req.body);
    checkPreExisting(req.body.sid)
        .then(function(preExistingSubmission){
            if(!preExistingSubmission) {
                const submission = new Submission(req.body);
                submission.dateCreated = new Date();
                submission.submissionHash = crypto.randomBytes(20).toString('hex');
                submission.save(function(response){
                    allocationUtils.runAllocation(submission);
                });

            } else {
                console.log("Error: submission exists");
            }
            responseSender.sendResponse(req);
        });
    res.status(200).send();
};


const checkPreExisting =  function(sid){
    return Submission.findOne({sid:sid})
        .then(function(response){
           return response;
        })
};



