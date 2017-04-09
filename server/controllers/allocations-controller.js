/**
 * Created by adamellis on 12/03/2017.
 */

const Allocation = require('../datasets/allocationModel');
const Submission = require('../datasets/submissionModel');
const markUtils = require('../utilities/mark-utils');

const submissionsController = require('./submissions-controller');

module.exports.getProviders = function(req,res){
    if(req.user.sid === Number(req.params.receiverSid) || true){
        exports.queryProviders({receiverSid:Number(req.params.receiverSid)})
            .then(function(response){
                res.send(response);
            })
    } else {
        res.status(401).send("Unauthorised");
    }

};

module.exports.queryProviders = function(query){
    return Submission.aggregate([
        {
            $lookup:{
                from:"allocations",
                localField:"sid",
                foreignField:"receiverSid",
                as:"providers"
            }
        },
        {
            $match:{"providers.receiverSid":query.receiverSid}
        },
        {
            $project:{"providers":1}
        }
    ])
        .then(function(response){
            return response[0];
        })

};



module.exports.getReceivers = function(req,res){
    //email address needs to be checked against a student not an assignment
    if(req.user.sid === Number(req.params.providerSid)||true){
        console.log("Hello");
        exports.queryReceivers({providerSid:Number(req.params.providerSid)})
            .then(function(response){
                res.send(response);
            })
    } else {
       res.status(401).send("Unauthorised");
    }

};

module.exports.queryReceivers = function(query){

    return Submission.aggregate(
        {
            $lookup:{
                from:"allocations",
                localField:"sid",
                foreignField:"providerSid",
                as:"receivers"
            }
        },
        {
            $match:{"receivers.providerSid":query.providerSid}
        },
        {
            $project:{"receivers":1}
        })
        .then(function(response){
            return response[0];
        })
};

module.exports.updateAllocation = function(req,res){


    if(req.user.sid === Number(req.params.providerSid)){
        const query = {
            receiverSid:req.params.receiverSid,
            providerSid:req.params.providerSid
        };


        const update = {
            $set:req.body
        };

        Allocation.findOneAndUpdate(query,update)
            .then(function(response){
                markUtils.updateMark(response);
                res.send(response);
            });
    } else{
        res.status(401).send("Unauthorised");
    }
};


module.exports.getOneAllocation = function (req,res) {

    const query = {
        receiverSid: req.params.receiverSid,
        providerSid: req.params.providerSid
    };

    if(req.user.sid === Number(req.params.providerSid) || true) {
        const projection = {
            receiverReport:0
        };
        Allocation.findOne(query)
            .then(function (response) {
                res.send(response);
            })
    } else if(req.user.sid === Number(req.params.receiverSid)){
        const projection = {
            providerReport:0
        };
        Allocation.findOne(query)
            .then(function (response) {
                res.send(response);
            })

    } else {
        res.status(401).send("Unauthorised");
    }


};