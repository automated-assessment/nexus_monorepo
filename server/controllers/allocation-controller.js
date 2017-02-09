var Submission = require('../datasets/submissionModel');
var Form = require('../datasets/formModel.js');
var async = require('async');

module.exports.createSubmission = function(req,res,next){

    var submission = new Submission(req.body);

    submission.save()
        .then(allocationPromise);


};


var allocationPromise = function(response){
    Form.find({aid:response.aid},function(err,formData){
        const providerCount = formData[0].providerCount;
        Submission.find({aid:response.aid},function(err,submissionData){
            var submissionsLength = submissionData.length;
            if(submissionsLength > providerCount){
                assignment(0);
                function assignment(i){
                    if(i<providerCount) {
                        //can be put in seperate fn
                        var random1 = Math.round(Math.random()*(submissionsLength-1));
                        var random2 = Math.round(Math.random()*(submissionsLength-1));
                        var receiver = submissionData[random1];
                        var provider = submissionData[random2];
                        if((receiver.studentuid !== provider.studentuid) &&
                            receiver.pid.length <= minPid(submissionData)){
                            console.log(minPid(submissionData));
                            receiver.pid.push(provider.studentuid);
                            receiver.save()
                                .then(function(response,err){
                                    assignment(++i);
                                });
                        } else {
                            assignment(i);
                        }
                    }
                }
            } else {
                //need to store as there are no allocation spots
                console.log("No allocation available");
                //is this possible? - perhaps if one student submits many times
                //how to deal? - inform student that they can only submit so many times to fix this?
            }
        });
    });
};





var minPid = function(submissionData){

    let pidLengths =[];

    for(var submission in submissionData){
        //console.log(`submission is ${submissionData[submission].pid.length}`);
        pidLengths.push(submissionData[submission].pid.length);
    }
    return Math.min(...pidLengths);
};


var debugAllocationPromise = function(response){

    Form.find({aid:response.aid},function(err,formData){
        const providerCount = formData[0].providerCount;
        Submission.find({aid:response.aid},function(err,submissionData){
            var submissionsLength = submissionData.length;
            if(submissionsLength > providerCount){
                assignment(0);
                function assignment(i){
                    if(i<providerCount) {
                        //can be put in seperate fn
                        var random1 = Math.round(Math.random()*(submissionsLength-1));
                        var random2 = Math.round(Math.random()*(submissionsLength-1));
                        console.log(`random 1(receiver) is ${random1+1} submission entry `);
                        console.log(`random 2(provider) is ${random2+1} submission entry`);
                        var receiver = submissionData[random1];
                        var provider = submissionData[random2];
                        //console.log(maxCount(submissionData));
                        console.log(provider);
                        console.log(receiver);
                        if((receiver.studentuid !== provider.studentuid) &&
                            receiver.pid.length < maxCount(submissionData)){
                            console.log("ASSIGN");
                            receiver.pid.push(provider.studentuid);
                            receiver.save()
                                .then(function(response,err){
                                    assignment(++i);
                                })
                        } else {
                            assignment(i);
                        }
                    } else {
                        console.log("Complete");
                    }
                }
                console.log("----------------BREAK-----------");
            }
        });
    });
};






