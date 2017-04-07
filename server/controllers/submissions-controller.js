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

        exports.queryOneSubmission(query)
            .then(function (response) {
                res.send(response);
            })

    } else {
        res.status(401).send("Unauthorised");
    }

};

module.exports.queryOneSubmission = function (query) {
    return Submission.findOne(query);
};


module.exports.getAssignmentSubmissions = function (req, res) {

    const query = {
        aid: req.params.aid
    };

    exports.queryAssignmentSubmissions(query)
        .then(function (response) {
            res.send(response);
        })

};


module.exports.queryAssignmentSubmissions = function (query) {
    return Submission.find(query);
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
    exports.queryOneSubmission({sid: submission.sid})
        .then(function (preExistingSubmission) {
            //preExistingSubmission = false;
            let isNew;
            if (preExistingSubmission) {
                isNew = false;
                submission = preExistingSubmission;
                res.status(200).send("Remarked submission");
            } else {
                isNew = true;
                submission.token = crypto.randomBytes(20).toString('hex');
                submission.dateCreated = new Date();
            }
            const url = `<iframe src="http://localhost:3050/#!/frame/allocation?sid=${submission.sid}&token=${submission.token}" height="500" width="1000"`
            assignmentsController.queryAssignment({aid: submission.aid})
                .then(function (assignment) {
                    const promises = [];
                    if (assignment) {
                        submission.academicEmail = assignment.email;
                    }
                    if (!preExistingSubmission) {
                        promises.push(submission.save()
                            .then(function () {
                                res.status(200).send();
                                return allocationUtils.runAllocation(submission, assignment)
                                    .then(function (response) {
                                        console.log("Complete");
                                    })
                            }));
                    }
                    Promise.resolve(promises)
                        .then(function (response) {
                            console.log("Promise.resolve worked for save()");
                            if(assignment){
                                responseUtils.sendResponse(submission, assignment);
                            } else {
                                responseUtils.sendFeedback(url, submission.sid);
                            }

                        })
                });


        })
};

module.exports.queryUpdateOneSubmission = function(query,update,options){
    return Submission.findOneAndUpdate(query,update,options);
}

