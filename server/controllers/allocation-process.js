/**
 * Created by adamellis on 17/02/2017.
 */


//need to ensure that student doesnt get same submission twice
//need to store when no allocation spots
//is this possible? - perhaps if one student submits many times
//how to deal? - inform student that they can only submit so many times to fix this?

const Form = require('../datasets/formModel.js');
const Submission = require('../datasets/submissionModel');


module.exports.runAllocation = function(response){

    Form.find({aid:response.aid},function(err,formData){
        const providerTotal = formData[0].providerCount;
        const minAllocationCount = formData[0].providerCount;
        Submission.find({aid:response.aid},function(err,submissionData){
            if(submissionData.length > minAllocationCount){
                assign(providerTotal,submissionData);
            }
        });
    });
};


const assign = function(providerTotal, submissionData){
    assignment(0);
    function assignment(i){
        if(i<providerTotal) {
            const provider = randomStudent(submissionData);
            const receiver = randomStudent(submissionData);
            if((receiver.studentuid !== provider.studentuid) &&
                receiver.providers.length <= minPid(submissionData)){
                receiver.providers.push({"no":provider.studentuid});
                receiver.save()
                    .then(function(response,err){
                        assignment(++i);
                    });
            } else {
                assignment(i);
            }
        }
    }
};

const randomStudent = function(submissionData){
    const submissionsLength = submissionData.length;
    const studentIndex = Math.round(Math.random()*(submissionsLength-1));
    return submissionData[studentIndex];

};


const minPid = function(submissionData){
    const providersCount =[];
    for(let submission in submissionData){
        providersCount.push(submissionData[submission].providers.length);
    }
    return Math.min(...providersCount);
};
