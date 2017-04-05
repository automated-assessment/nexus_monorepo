/**
 * Created by adamellis on 12/03/2017.
 */

const Allocation = require('../datasets/allocationModel');
const Submission = require('../datasets/submissionModel');

module.exports.getProviders = function(req,res){

    if(req.user.sid === Number(req.params.receiverSid)){
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
    } else {
        res.status(401).send("Unauthorised");
    }

};

module.exports.getReceivers = function(req,res){
    if(req.user.sid === Number(req.params.providerSid)){
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
    } else {
       res.status(401).send("Unauthorised");
    }

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

    if(req.user.sid === Number(req.params.providerSid)) {
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