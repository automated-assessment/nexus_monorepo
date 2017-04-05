/**
 * Created by adamellis on 03/03/2017.
 */

const Submission = require('../datasets/submissionModel');
const allocationUtils = require('./../utilities/allocation-utils');
const responseUtils = require('./../utilities/response-utils');
const crypto = require('crypto');
const assignmentsController = require('./assignments-controller');


module.exports.getAllSubmissions = function (req, res) {

    Submission.find()
        .then(function (response) {
            res.send(response);
        });
};

module.exports.getOneSubmission = function (req, res) {

    if (req.user.sid === Number(req.params.sid)) {
        const query = {
            sid: req.params.sid
        };

        Submission.findOne(query)
            .then(function (response) {
                res.send(response);
            })
    } else {
        res.status(401).send("Unauthorised");
    }

};

module.exports.getAssignmentSubmissions = function (req, res) {

    const query = {
        aid: req.params.aid
    };

    Submission.find(query)
        .then(function (response) {
            res.send(response);
        })
};

module.exports.getGitData = function (sid) {

    const query = {
        sid: sid
    };

    const projection = {
        sha: 1,
        branch: 1,
        cloneurl: 1
    };

    return Submission.findOne(query, projection)
        .then(function (response) {
            return response;
        })
};

//TODO: check duplication of SHA and branch from submissions and allocations
module.exports.createSubmission = function (req, res) {
    let submission = new Submission(req.body);
    assignmentsController.getAssignment(submission)
        .then(function (assignment) {
            if (assignment) {
                checkPreExisting(submission.sid)
                    .then(function (preExistingSubmission) {
                        let promise = "";
                        if (preExistingSubmission) {
                            res.status(200).send("Remark");
                            submission = preExistingSubmission;
                        } else {
                            promise = saveAndAllocate(submission,assignment,res);
                        }
                        Promise.resolve(promise)
                            .then(function (response) {
                                responseUtils.sendResponse(submission, assignment);
                            });
                    });
            } else {
                res.status(404).send("Assignment does not exist");
            }
        });
};

function saveAndAllocate(submission,assignment,res){
    submission.configuration = assignment.additionalConfiguration;
    submission.submissionHash = crypto.randomBytes(20).toString('hex');
    submission.dateCreated = new Date();
    return submission.save()
        .then(function (submission) {
            res.status(200).send("Saved");
            return allocationUtils.runAllocation(submission, assignment);
        },function(err){
            res.status(400).send("Error submitting");
        });
}

const checkPreExisting = function (sid) {
    return Submission.findOne({sid: sid})
        .then(function (response) {
            return response;
        })
};



