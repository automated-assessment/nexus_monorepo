/**
 * Created by adamellis on 17/02/2017.
 */


//need to ensure that student doesnt get same submission twice
//need to store when no allocation spots
//is this possible? - perhaps if one student submits many times
//how to deal? - inform student that they can only submit so many times to fix this?

const Form = require('../datasets/formModel');
const Submission = require('../datasets/submissionModel');


module.exports.runAllocation = function(submission){
    queryAssignment(submission)
        .then(function(assignment){
            querySubmissionCount(submission.aid)
                .then(function(count){
                    if(count<Math.pow(assignment.providerCount,2)){
                        backTrack(assignment);
                    }
                    allocate(assignment,submission);
                });
        })

};


const querySubmissionCount = function(aid){
    return Submission.count({aid:aid})
        .then(function(response){
            return response;
        })

};

const backTrack = function(assignment){
    Submission.find({$where:'this.providers.length < 3'})
        .then(function(unallocated) {
            unallocated.forEach(function(submission){
                allocate(assignment,submission);
            })
        })
};

const queryAssignment = function(submission){
    return Form.findOne({aid:submission.aid},{_id:0,providerCount:1,formBuild:1})
        .then(function(formData){
            return formData;
        })

};

const allocate = function(assignment,submission){
    queryProviders(assignment,submission)
        .then(function(providers){
            let providersArray = [];
            providers.forEach(function(provider){
                const providerObj = {
                    provideruid:provider.studentuid,
                    currentForm:assignment.formBuild,
                    provided:false
                };
                providersArray.push(providerObj);
            });

            submission.providers = providersArray;
            submission.save();
        })
};

const queryProviders = function(assignment,submission){
    return Submission.aggregate(
        [
            {$match:
                {$and:
                    [
                        {studentuid:{$ne:submission.studentuid}},
                        {aid:submission.aid}
                    ]
                }
            },
            {$sample:{size:assignment.providerCount}}
        ])
};