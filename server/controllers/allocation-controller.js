/**
 * Created by adamellis on 10/02/2017.
 */

const Submission = require('../datasets/submissionModel');


module.exports.getProvideTo = function(req,res){
    Submission.find({"providers.provideruid":Number(req.query.studentuid)},{_id:0,studentuid:1})
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

module.exports.getReceivedFrom = function(req,res) {

    //use the student numbers for that particular student id to resolve the submission numbers
    const studentuid = req.query.studentuid;
    const aid = req.query.aid;

    Submission.findOne({aid: aid, studentuid: studentuid})
        .then(function(response){
           res.status(200).send(response);
        });
};