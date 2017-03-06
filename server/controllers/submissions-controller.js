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


//this should be get providers.
module.exports.getReceiverSubmissions = function(req,res){

    const query = {
        sid:req.params.sid
    };

    const projection = {
        student: 1,
        studentemail: 1,
        sid: 1,
        branch: 1,
        providers:1
    };

    Submission.find(query,projection)
        .then(function(response){
            res.send(response);
        })
};


//this should be get receivers.
module.exports.getProviderSubmissions = function(req,res){

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
                    "studentemail":"$studentemail",
                    "currentForm":"$providers.currentForm",
                    "provided":"$providers.provided"
                }
            }
        },
        {
            $group:{
                _id:Math.random(),
                "providersid":{$addToSet:"$root.sid"},
                "student":{$addToSet:"$root.student"},
                "studentemail":{$addToSet:"$root.studentemail"},
                "receivers":{$addToSet:"$tempreceivers"}
            },
        },
        {$unwind:'$providersid'},{$unwind:'$student'},{$unwind:'$studentemail'}


    )
        .then(function(response){
            console.log(res);
            res.send(response);

        });

};




module.exports.updateProviderForm = function(req,res){



    const query = {
        sid:req.params.sid,
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

