/**
 * Created by adamellis on 17/02/2017.
 */


//need to ensure that student doesnt get same submission twice
//need to store when no allocation spots
//is this possible? - perhaps if one student submits many times
//how to deal? - inform student that they can only submit so many times to fix this?

const Assignment = require('../datasets/assignmentModel');
const Submission = require('../datasets/submissionModel');

/**
 * Entrypoint to running the allocation algorithm.
 * @param submission
 */
module.exports.runAllocation = function(submission){
    queryAssignment(submission)
        .then(function(assignment){
            allocate(assignment,submission);
        })

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
    const bulk = Submission.collection.initializeUnorderedBulkOp();
    queryRandomProviders(assignment,submission)
        .then(function(randomProviders){
            randomProviders.forEach(function(randomProvider){
                submission.providers.push(randomProvider.sid);
                randomProvider.providers.push(submission.sid);
                bulk.find({sid:randomProvider.sid}).updateOne({$push:{providers:submission.sid}})

            });
            bulk.insert(submission);

            bulk.execute()
                .then(function(){
                    console.log("Allocation complete.");
                });

        });
};

/**
 *  Queries a number of providers for that particular submission, ensuring that
 *  the student is not self-allocated and that the submission is for the correct assignment.
 *
 * @param assignment
 * @param submission
 * @returns Promise of an array of providers
 */

//Allocations may overflow, if this happens...
// include in match submission.providers.length < providerCount

const queryRandomProviders = function(assignment,submission) {
    return Submission.aggregate(
        [
            {
                $project:{
                    _id:1,
                    aid:1,
                    studentuid:1,
                    sid:1,
                    providers:1,
                    branch:1,
                    size_providers:{$size:"$providers"}
                }
            },
            {
                $match: {
                    $and: [
                        {studentuid: {$ne: submission.studentuid}},
                        {aid: submission.aid},
                        {size_providers:{$lt:3}}
                    ]
                }
            },
            {$sample: {size: assignment.providerCount}}
        ])
};


