/**
 * Created by adamellis on 03/03/2017.
 */

const Submission = require('../datasets/submissionModel');
const allocationProcess = require('./allocation-process');
const responseSender = require('./response-sender');



module.exports.getAllSubmissions = function(req,res){

    Submission.find()
        .then(function(response){
           res.send(response);
        });
};

module.exports.getSubmissions = function(req,res){

    const query = {
        aid:req.params.aid
    };

    Submission.find(query)
        .then(function(response){
            res.send(response);
        })
};

module.exports.getSubmissionRelation = function(req,res){

    const query = {
        sid:req.params.receiversid,
        "providers.providersid":Number(req.params.providersid)
    };
    const projection = {
        _id:0,
        "providers.$":1
    };


    Submission.findOne(query,projection)
        .then(function(response){
            if(response){
                response = response.providers[0];
            }
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




module.exports.updateProviderForm = function(req,res){



    const query = {
        sid:req.params.receiversid,
        "providers.providersid":Number(req.params.providersid)
    };

    const update = {
        $set:{
            "providers.$.currentForm": req.body.currentForm,
            "providers.$.provided": req.body.provided
        }

    };

    Submission.findOneAndUpdate(query,update)
        .then(function(response){
            res.send(response);
        })
};


module.exports.createSubmission = function(req,res){
    queryIsNewSubmission(req.params.sid)
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

