var Submission = require('../datasets/submissionModel');
var Form = require('../datasets/formModel.js');

module.exports.createSubmission = function(req,res,next){

    var submission = new Submission(req.body);

    submission.save()
        .then(allocationPromise);


};



var allocationPromise = function(response){

   Form.find({aid:response.aid},function(err,formData){
       var providerCount = formData[0].providerCount;
       Submission.find({aid:response.aid},function(err,formData){
           var submissionsLength = formData.length;
           if(submissionsLength > providerCount){
               var random1 = Math.round(Math.random()*(submissionsLength-1));
               var random2 = Math.round(Math.random()*(submissionsLength-1));

               for(var i=0;i<providerCount;i++){
                   var receiver = formData[random1];
                   var provider = formData[random2];
                   if((receiver.studentuid !== provider.studentuid) &&
                       receiver.pid.length <= maxCount(formData) &&
                       provider.pid.length <= maxCount(formData)){

                       provider.pid.push(receiver.sid);
                       provider.save();
                   }
               }

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
