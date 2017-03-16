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
module.exports.runAllocation = function(submission){
    queryAssignment(submission)
        .then(function(assignment){
            if(assignment){
                allocate(assignment,submission);
            } else {
                console.log("No assignment found");
            }

        });

};
/**
 * Queries the assignment for this particular submission
 * @param submission
 * @returns Promise of a single matching assignment
 */
const queryAssignment = function(submission){
    return Assignment.findOne({aid:submission.aid},{_id:0,providerCount:1,formBuild:1})
        .then(function(assignment){
            return assignment;
        })

};


/**
 * Allocates the providers as given by the queryProviders promise,
 * to the receiving student.
 *
 * @param assignment
 * @param submission
 */
const allocate = function(assignment,submission){
    const allocationArray = [];


    queryRandomProviders(assignment, submission)
        .then(function(randomProviders){
            console.log("Random providers",randomProviders);
            randomProviders.forEach(function(randomProvider){
                const forwardAssociation = associate(submission.sid, randomProvider.sid, assignment);
                const backwardAssociation = associate(randomProvider.sid,submission.sid, assignment);
                allocationArray.push(forwardAssociation);
                allocationArray.push(backwardAssociation);
            });


            console.log("Final Array",allocationArray);
            Allocation.insertMany(allocationArray)
                .then(function(response){
                    console.log("Allocation complete");
                })


        });
};



const associate = function(receiverSid,providerSid,assignment){
    return {
        currentForm:assignment.formBuild,
        receiverSid:receiverSid,
        providerSid:providerSid,
        alias:randomName({seed:Math.random()}),
        provided:false,
        dateAllocated:new Date(),
        dateModified:new Date(),
        providerMark:null
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

//Needs optimizing
const queryRandomProviders = function(assignment,submission) {
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
                $lookup:
                    {
                        from:"allocations",
                        localField:"sid",
                        foreignField:"receiverSid",
                        as:"providers"
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
                    size: assignment.providerCount}
            },
            {
                $project:{sid:1}
            }
        ])

};


