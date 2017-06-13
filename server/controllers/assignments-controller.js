/**
 * Created by adamellis on 03/03/2017.
 */
"use strict";
const Assignment = require('../datasets/assignmentModel');
const submissionsController = require('./submissions-controller');
const responseUtils = require('../utilities/response-utils');
const allocationUtils = require('../utilities/allocation-utils');
module.exports.getAllAssignments = function (req, res) {
    Assignment.find({})
        .then(function (response) {
            res.send(response);
        });
};

module.exports.getOneAssignment = function (req, res) {
    const query = {
        aid: req.params.aid
    };

    exports.queryOneAssignment(query)
        .then(function (response) {
            res.send(response);
        })
};

module.exports.queryOneAssignment = function (query) {
    return Assignment.findOne(query);
};

module.exports.updateAssignment = function (req, res) {

    const query = {
        aid: req.params.aid
    };

    const update = req.body;

    const options = {
        upsert: true,
        new: true
    };

    Assignment.findOneAndUpdate(query, update, options)
        .then(function (assignment) {
            const promises = [];
            const checkPrevious = submissionsController.queryAssignmentSubmissions({isAllocated: false})
                .then(function (submissions) {
                    const submissionsToUpdate = [];
                    let p = Promise.resolve();
                    for (let i = 0; i < submissions.length; i++) {
                        if (!submissions[i].isAllocated) {
                            p = p.then(function () {
                                const query = {
                                    sid: submissions[i].sid,
                                };
                                const update = {
                                    academicEmail: assignment.email
                                };
                                return submissionsController.queryUpdateOneSubmission(query, update)
                                    .then(function (response) {
                                        const request = {
                                            submission: {
                                                exists: true,
                                                value: submissions[i],
                                                allocate: true
                                            },
                                            assignment: assignment
                                        };
                                        return submissionsController.allocateAndRespond(request);
                                    });
                            })
                        }
                    }
                });
            res.send(assignment);
        });
};


