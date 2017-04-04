/**
 * Created by adamellis on 17/02/2017.
 */


const Assignment = require('../datasets/assignmentModel');
const Allocation = require('../datasets/allocationModel');
const Submission = require('../datasets/submissionModel');

const randomName = require('node-random-name');

/**
 * Entrypoint to running the allocation algorithm.
 * @param submission
 */

/**
 * Allocates the providers as given by the queryProviders promise,
 * to the receiving student.
 *
 * @param assignment
 * @param submission
 */
module.exports.runAllocation = function (submission, assignment) {

    const allocationArray = [];
    queryRandomProviders(assignment, submission)
        .then(function (randomProviders) {
            randomProviders.forEach(function (randomProvider) {
                const forwardAssociation = associate(submission, randomProvider, assignment);
                const backwardAssociation = associate(randomProvider, submission, assignment);
                allocationArray.push(forwardAssociation);
                allocationArray.push(backwardAssociation);
            });
            if (allocationArray.length != 0) {
                console.log(allocationArray);
                Allocation.insertMany(allocationArray)
                    .then(function (response) {
                        console.log("Allocation complete");
                    })
            }
        });
};

const associate = function (receiver, provider, assignment) {
    //this is actually an Allocation object. it should be created and treated as such.
    return {
        currentForm: assignment.formBuild,
        receiverSid: receiver.sid,
        providerSid: provider.sid,
        alias: randomName({seed: Math.random()}),
        provided: false,
        dateAllocated: new Date(),
        dateModified: new Date(),
        providerMark: null
    }
};


/**
 *  Queries a number of providers for that particular submission, ensuring that
 *  the student is not self-allocated and that the submission is for the correct assignment.
 *
 * @param assignment
 * @param submission
 * @returns Promise of an array of providers
 */

const queryRandomProviders = function (assignment, submission) {
    return Submission.aggregate(
        [
            {
                $match: {
                    $and: [
                        {studentuid: {$ne: submission.studentuid}},
                        {aid: submission.aid}
                    ]
                }
            },
            {
                $lookup: {
                    from: "allocations",
                    localField: "sid",
                    foreignField: "receiverSid",
                    as: "providers"
                }
            },
            {
                $addFields: {
                    size_providers: {$size: "$providers"}
                }
            },
            {
                $match: {
                    size_providers: {$lt: assignment.providerCount}
                }
            },
            {
                $sample: {
                    size: assignment.providerCount
                }
            },
            {
                $project: {sid: 1, branch: 1, sha: 1}
            }
        ])

};


