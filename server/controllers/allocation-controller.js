/**
 * Created by adamellis on 10/02/2017.
 */


const Submission = require('../datasets/submissionModel');

module.exports.getProvideTo = function(req,res){
    Submission.find({studentpid:Number(req.query.studentuid)},{_id:0,studentuid:1})
        .then(function(response){

            let studentId=[];
            for(let i=0;i<response.length;i++) {
                studentId[i] = response[i].studentuid;
            }
            Submission.find({studentuid:{$in:studentId}})
                .then(function(response){
                    res.status(200).send(response);
                });
        });

};

module.exports.getReceivedFrom = function(req,res){

    //use the student numbers for that particular student id to resolve the submission numbers


    studentId = req.query.studentuid;

    Submission.find({studentuid:studentId},{_id:0,studentpid:1})
        .then(function(response){
            let studentIdArray = [];
            let counter = 0;

            for(let i=0;i<response.length;i++){
                for(let j=0;j<response[i].studentpid.length;j++){
                    studentIdArray[counter] = response[i].studentpid[j];
                    ++counter;
                }
            }
            Submission.find({studentuid:{$in:studentIdArray}})
                .then(function(response){
                    res.status(200).send(response);
                });
        });

};


