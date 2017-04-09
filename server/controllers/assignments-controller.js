/**
 * Created by adamellis on 03/03/2017.
 */

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
                    for (let i = 0; i < submissions.length; i++) {
                        if (!submissions[i].isAllocated) {
                            submissionsToUpdate.push(submissions[i]);
                        }
                    }
                    runUpdates(0, submissionsToUpdate, assignment);
                    res.send(assignment);
                });


        });
};

function runUpdates(i, submissions, assignment) {

    if(i===submissions.length){
        return;
    }
    if (i < submissions.length) {
        console.log("Running an allocation");
        const updateSubmission = submissionsController.queryUpdateOneSubmission({sid: submissions[i].sid}, {academicEmail: assignment.email});
        const request = {
            submission: {
                exists: false,
                value: submissions[i],
                allocate: true
            },
            assignment: assignment
        };
        const allocateWithResponse = submissionsController.allocateAndRespond(request);

        Promise.all([updateSubmission, allocateWithResponse])
            .then(function () {
                runUpdates(i+1, submissions, assignment)
            })
    }


}
