/**
 * Created by adamellis on 03/03/2017.
 */

const Submission = require('../datasets/submissionModel');
const allocationUtils = require('./../utilities/allocation-utils');
const responseUtils = require('./../utilities/response-utils');
const crypto = require('crypto');
const assignmentsController = require('./assignments-controller');


module.exports.getAllSubmissions = function (req, res) {
    console.log(req.user.email);
    Submission.find({aid: Number(req.params.aid), academicEmail: String(req.user.email)})
        .then(function (response) {
            console.log(response);
            res.send(response);
        });
};

module.exports.getOneSubmission = function (req, res) {
    let auth;
    let promise;
    if (req.user.sid === Number(req.params.sid)) {
        auth = true;
    } else {

        promise = req.user.isAcademicOf(req.params.sid)
            .then(function (isAuth) {
                auth = isAuth;
            });


    }
    Promise.resolve(promise)
        .then(function () {
            if (auth) {
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
        });


};

module.exports.queryOneSubmission = function (query) {
    return Submission.findOne(query);
};


module.exports.getAssignmentSubmissions = function (req, res) {


    console.log("Received req")
    if(req.user.aid === Number(req.params.aid)){

        const query = {
            aid: req.params.aid,
            academicEmail:req.user.email
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

//This needs fixing
module.exports.createSubmission = function (req, res) {

    let request = {
        submission: {
            exists: false,
            value: new Submission(req.body),
            allocate:true
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
            }});
    const assignmentExists = assignmentsController.queryOneAssignment({aid:req.body.aid})
        .then(function(assignment){
            if(assignment){
                request.assignment = assignment;
            } else {
                request.submission.allocate = false;
            }
        });

    Promise.all([assignmentExists,isNewSubmission])
        .then(function(){
            if(!request.submission.exists){
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
        console.log("Allocation running");

        promise = allocationUtils.runAllocation(submission,request.assignment)
            .then(function(){
                return exports.queryUpdateOneSubmission({sid:submission.sid},{isAllocated:true});
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

