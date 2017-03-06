/**
 * Created by adamellis on 17/02/2017.
 */


const Assignment = require('../datasets/assignmentModel');
const Submission = require('../datasets/submissionModel');
const crypto = require('crypto');
const randomName = require('node-random-name');

/**
 * Entrypoint to running the allocation algorithm.
 * @param submission
 */
module.exports.runAllocation = function(submission){
    submission.providers = [];
    submission.dateCreated = new Date();
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

                const providerObj = generateStudentObject(randomProvider,assignment);
                const submissionObj = generateStudentObject(submission,assignment);
                submission.providers.push(providerObj);
                bulk.find({sid:randomProvider.sid}).updateOne({$push:{providers:submissionObj}})

            });
            submission.hash = crypto.randomBytes(20).toString('hex');
            bulk.insert(submission);

            bulk.execute()
                .then(function(){
                    console.log("Allocation complete.");
                });

        });
};

const generateStudentObject = function(perspective,assignment){

    console.log("perspective",perspective);

    return {
        alias:randomName({seed:Math.random()}),
        providersid:perspective.sid,
        student:perspective.student,
        studentemail:perspective.studentemail,
        currentForm:assignment.formBuild,
        provided:false
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

//Allocations may overflow, if this happens...
// include in match submission.providers.length < providerCount

const queryRandomProviders = function(assignment,submission) {
    return Submission.aggregate(
        [
            {
                //use $addFields
                $addFields:{
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


