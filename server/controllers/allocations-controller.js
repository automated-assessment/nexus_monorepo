/**
 * Created by adamellis on 12/03/2017.
 */

const Allocation = require('../datasets/allocationModel');
const Submission = require('../datasets/submissionModel');
const markUtils = require('../utilities/mark-utils');

const submissionsController = require('./submissions-controller');

module.exports.getProviders = function (req, res) {
    let projection = {null:0};
    if (req.user.sid === Number(req.params.receiverSid) || req.user.email) {
        if(!req.user.email){
            projection = {
                "providers.title.receiverName":0,
                "providers.title.providerName":0
            };
        }
        exports.queryProviders({receiverSid: Number(req.params.receiverSid)},projection)
            .then(function (response) {
               res.send(response);
            })
    } else {
        res.status(401).send("Unauthorised");
    }

};

module.exports.queryProviders = function (query,project) {
    return Submission.aggregate([
        {
            $lookup: {
                from: "allocations",
                localField: "sid",
                foreignField: "receiverSid",
                as: "providers"
            }
        },
        {
            $match: {"providers.receiverSid": query.receiverSid}
        },
        {
            $project: {"providers": 1}
        },
        {
            $project:project
        }
    ])
        .then(function (response) {
            return response[0];
        })

};


module.exports.getReceivers = function (req, res) {
    let projection = {null:0};
    if (req.user.sid === Number(req.params.providerSid) || req.user.email) {
        if(!req.user.email){
            projection = {
                "receivers.title.receiverName":0,
                "receivers.title.providerName":0
            };
        }
        exports.queryReceivers({providerSid: Number(req.params.providerSid)},projection)
            .then(function (response) {
                res.send(response);
            })
    } else {
        res.status(401).send("Unauthorised");
    }

};

module.exports.queryReceivers = function (query,project) {

    return Submission.aggregate(
        {
            $lookup: {
                from: "allocations",
                localField: "sid",
                foreignField: "providerSid",
                as: "receivers"
            }
        },
        {
            $match: {"receivers.providerSid": query.providerSid}
        },
        {
            $project: {"receivers": 1}
        },
        {
            $project:project
        })
        .then(function (response) {
            return response[0];
        })
};

module.exports.updateAllocation = function (req, res) {


    if (req.user.sid === Number(req.params.providerSid)) {
        const query = {
            receiverSid: req.params.receiverSid,
            providerSid: req.params.providerSid
        };


        const update = {
            $set: req.body
        };

        Allocation.findOneAndUpdate(query, update)
            .then(function (response) {
                markUtils.updateMark(response);
                res.send(response);
            });
    } else {
        res.status(401).send("Unauthorised");
    }
};


module.exports.getOneAllocation = function (req, res) {

    let projection = {};
    if (!req.user.email) {
       projection = {
            "title.providerName": 0,
            "title.receiverName": 0
        }
    }
    const query = {
        receiverSid: req.params.receiverSid,
        providerSid: req.params.providerSid
    };

    if (req.user.sid === Number(req.params.providerSid) || req.user.sid === Number(req.params.receiverSid) || req.user.email) {
        Allocation.findOne(query, projection)
            .then(function (response) {
                res.send(response);
            })
    }
};