/**
 * Created by adamellis on 12/03/2017.
 */

const Allocation = require('../datasets/allocationModel');
const Submission = require('../datasets/submissionModel');

module.exports.getProviders = function(req,res){
    console.log(req.params);
    Submission.aggregate([
        {
            $lookup:{
                from:"allocations",
                localField:"sid",
                foreignField:"receiverSid",
                as:"providers"
            }
        },
        {
            $match:{"providers.receiverSid":Number(req.params.receiverSid)}
        },
        {
            $project:{"providers":1}
        }
    ])
        .then(function(response){
            response = response[0];
            res.send(response);
        })
};

module.exports.getReceivers = function(req,res){
    Submission.aggregate(
        {
            $lookup:{
                from:"allocations",
                localField:"sid",
                foreignField:"providerSid",
                as:"receivers"
            }
        },
        {
            $match:{"receivers.providerSid":Number(req.params.providerSid)}
        },
        {
            $project:{"receivers":1}
        })
        .then(function(response){
            response = response[0];
            res.send(response);
        })
};

module.exports.updateCurrentForm = function(req,res){
    console.log(req.params.receiverSid,req.params.providerSid);
    const query = {
        receiverSid:req.params.receiverSid,
        providerSid:req.params.providerSid
    };

    const update = {
        $set:{
            currentForm: req.body.currentForm,
            provided: req.body.provided
        }

    };

    Allocation.findOneAndUpdate(query,update)
        .then(function(response){
            res.send(response);
        });
};

module.exports.getOneAllocation = function (req,res) {
    const query = {
        receiverSid:req.params.receiverSid,
        providerSid:req.params.providerSid
    };

    Allocation.findOne(query)
        .then(function(response){
            res.send(response);
        })
};