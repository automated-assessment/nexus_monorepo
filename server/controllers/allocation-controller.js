var Submission = require('../datasets/submissionModel');
var Form = require('../datasets/formModel.js');
var async = require('async');

module.exports.createSubmission = function(req,res,next){

    var submission = new Submission(req.body);

    submission.save()
        .then(buildingAllocPromise);


};

var buildingAllocPromise = function(response){


    Submission.find({},function(err,submissionData){
            const providerCount = 3;
            assignment(0);
            function assignment(i){
                if(i<providerCount) {
                    submissionData[17].pid.push(6);
                    submissionData[17].save()
                        .then(function (response, err) {
                            assignment(++i);
                        });
                } else {
                    console.log("Complete");
                }
            }

    })
};



// console.log(`random 1(receiver) is ${random1+1} submission entry `);
// console.log(`random 2(provider) is ${random2+1} submission entry`);

var allocationPromise = function(response){
    Form.find({aid:response.aid},function(err,formData){
        const providerCount = formData[0].providerCount;
        Submission.find({aid:response.aid},function(err,submissionData) {

                    if(submissionData.length>3){

                        var submission = submissionData[0];
                        for (var i = 0; i < 3; i++) {
                            submission.pid.push(3);
                            console.log(submission.pid.length);
                            submission.save();
                        }

                    }



        })
    })
};


            //     for(let i=0;i<providerCount;){
            //         console.log(`${i} iteration`);
            //         var random1 = Math.round(Math.random()*(submissionsLength-1));
            //         var random2 = Math.round(Math.random()*(submissionsLength-1));
            //         var receiver = formData[random1];
            //         var provider = formData[random2];
            //         if((receiver.studentuid !== provider.studentuid)){
            //             receiver.pid.push('hit');
            //             receiver.save();
            //             i++;
            //         }
            //
            //     }


var debugAllocationPromise = function(response){

   Form.find({aid:response.aid},function(err,formData){
       const providerCount = formData[0].providerCount;
       Submission.find({aid:response.aid},function(err,formData){
           var submissionsLength = formData.length;
           if(submissionsLength > providerCount){
               for(let i=0;i<providerCount;){
                   console.log(`${i} iteration`);
                   var random1 = Math.round(Math.random()*(submissionsLength-1));
                   var random2 = Math.round(Math.random()*(submissionsLength-1));
                   console.log(`random 1(receiver) is ${random1+1} submission entry `);
                   console.log(`random 2(provider) is ${random2+1} submission entry`);
                   var receiver = formData[random1];
                   var provider = formData[random2];
                   if((receiver.studentuid !== provider.studentuid) &&
                       provider.pid.length <= maxCount(formData)){
                       ++i;
                       console.log("ASSIGN");
                       receiver.pid.push(provider.studentuid);
                       receiver.save();
                   }


               }
               console.log("----------------BREAK-----------");

           }
       });
   });
};

var maxCount = function(formData){
    var max = 0;
    for(var submission in formData){
        if(formData[submission].pid.length > max){
            max = formData[submission].pid.length;
        }
    }
    return max;
};

// var allocation = function(err, submission){
//     Submission.find(function(err,foundData){
//         Submission.count(function(err,count){
//             console.log(foundData);
//             var randomNumber = Math.round((Math.random()*(count-1)));
//             console.log(foundData[randomNumber].branch + "vs " +submission.branch);
//             console.log(foundData[randomNumber].sid);
//             submission.pid.push(foundData[randomNumber].sid);
//             console.log(submission.pid);
//
//             console.log();
//             if(submission.branch !== foundData[randomNumber].branch ) { //Check that receiver != provider
//                 submission.pid.push(foundData[randomNumber].sid);
//                 console.log("Pid pushed");
//                 submission.update();
//             }
//         });
//     })
// };

//Allocation algorithm:

// var allocationPromise = function(response){
//
//     Form.find({aid:response.aid},function(err,formData){
//         var providerCount = formData[0].providerCount;
//         Submission.find({aid:response.aid},function(err,formData){
//             var submissionsLength = formData.length;
//             if(submissionsLength > providerCount){
//                 var random1 = Math.round(Math.random()*(submissionsLength-1));
//                 var random2 = Math.round(Math.random()*(submissionsLength-1));
//
//                 for(var i=0;i<providerCount;i++){
//                     var receiver = formData[random1];
//                     var provider = formData[random2];
//                     if((receiver.studentuid !== provider.studentuid) &&
//                         receiver.pid.length <= maxCount(formData) &&
//                         provider.pid.length <= maxCount(formData)){
//
//                         provider.pid.push(receiver.sid);
//                         provider.save();
//                     }
//                 }
//
//             }
//         });
//     });
// };
//
// var maxCount = function(formData){
//     var max = 0;
//     for(var submission in formData){
//         if(formData[submission].pid.length > max){
//             max = formData[submission].pid.length;
//         }
//     }
//     return max;
// };
