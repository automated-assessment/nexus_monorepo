/**
 * Created by adamellis on 03/03/2017.
 */

const Submission = require('../datasets/submissionModel');
const allocationUtils = require('./allocation-utils');
const responseSender = require('./response-sender');
const crypto = require('crypto');


module.exports.getAllSubmissions = function(req,res){

    Submission.find()
        .then(function(response){
           res.send(response);
        });
};

module.exports.getSubmission = function(req,res){

    const query = {
        sid:req.params.sid
    };

    Submission.find(query)
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

module.exports.getAllocation = function(req,res){

    const query = {
        receiverSid:req.params.receiversid,
        providerSid:req.params.providersid
    };



    Submission.findOne(query,projection)
        .then(function(response){
            if(response){
                response = response.providers[0];
            }
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







module.exports.createSubmission = function(req,res){
    queryIsNewSubmission(req.params.sid)
        .then(function(isNewSubmission){
            if(isNewSubmission) {
                const submission = new Submission(req.body);
                submission.dateCreated = new Date();

                submission.hash = crypto.randomBytes(20).toString('hex');

                submission.save(function(response){
                    console.log("Hit");
                    allocationUtils.runAllocation(submission);
                });

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

