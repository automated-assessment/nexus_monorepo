/**
 * Created by adamellis on 12/03/2017.
 */

const Allocation = require('../datasets/allocationModel');
const markUtils = require('../utilities/mark-utils');

const submissionsController = require('./submissions-controller');

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

    if (req.user.sid === Number(req.params.providerSid)
        || req.user.sid === Number(req.params.receiverSid)
        || req.user === true
        ||req.user.email) {
        Allocation.findOne(query, projection)
            .then(function (response) {
                res.send(response);
            })
    }
};
