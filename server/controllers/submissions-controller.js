/**
 * Created by adamellis on 03/03/2017.
 */
const Submission = require('../datasets/submissionModel');
const allocationUtils = require('./../utilities/allocation-utils');
const responseUtils = require('./../utilities/response-utils');
const crypto = require('crypto');
const assignmentsController = require('./assignments-controller');


module.exports.getAllSubmissions = function (req, res) {
    Submission.find({aid: Number(req.params.aid), academicEmail: String(req.user.email)})
        .then(function (response) {
            res.send(response);
        });
};

module.exports.getOneSubmission = function (req, res) {
    if (req.user.sid === Number(req.params.sid) || req.user.email) {
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
    if (req.user.aid === Number(req.params.aid)) {

        const query = {
            aid: req.params.aid
        };

        exports.queryAssignmentSubmissions(query)
            .then(function (response) {
                res.send(response);
            })
    } else {
        res.status(401).send("Unauthorised");
    }


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

module.exports.createSubmission = function (req, res) {

    let request = {
        submission: {
            exists: false,
            value: new Submission(req.body),
            allocate: true
        },
        assignment: null
    };
    const isNewSubmission = exports.queryOneSubmission({sid: req.body.sid})
        .then(function (preExistingSubmission) {
            if (preExistingSubmission) {
                request.submission.allocate = false;
                request.submission.exists = true;
                request.submission.value = preExistingSubmission;
                res.status(200).send("Remarked submission successfully");
            }
        });
    const assignmentExists = assignmentsController.queryOneAssignment({aid: req.body.aid})
        .then(function (assignment) {
            if (assignment) {
                request.assignment = assignment;
            } else {
                request.submission.allocate = false;
            }
        });

    Promise.all([assignmentExists, isNewSubmission])
        .then(function () {
            if (!request.submission.exists) {
                const submission = new Submission(req.body);
                submission.token = crypto.randomBytes(20).toString('hex');
                submission.dateCreated = new Date();
                submission.isAllocated = request.submission.allocate;
                if (request.assignment) {
                    submission.academicEmail = request.assignment.email;
                }
                request.submission.value = submission;
                const save = request.submission.value.save()
                    .then(function () {
                        res.status(200).send("Successfully sent new submission");
                    });
            }
            exports.allocateAndRespond(request);
        })

};

module.exports.allocateAndRespond = function (request) {
    let promise;
    const submission = request.submission.value;
    const assignment = request.assignment;
    if (request.submission.allocate) {
        promise = allocationUtils.runAllocation(submission, request.assignment)
            .then(function () {
                return exports.queryUpdateOneSubmission({sid: submission.sid}, {isAllocated: true});
            });
    }

    return Promise.resolve(promise)
        .then(function () {
            responseUtils.sendResponse(submission, assignment);
        });
};


module.exports.queryUpdateOneSubmission = function (query, update, options) {
    return Submission.findOneAndUpdate(query, update, options);
};

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
