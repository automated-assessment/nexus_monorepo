/**
 * Created by adamellis on 10/02/2017.
 */
//Some of this code can be used for the admin view, but essentially an allocation page should not be required.
    //Simply return the students personal allocation as the response, which should be handled in response controller.
    //Handled as a response controller and not as allocation, as the response is an API call and not necessarily an allocation.
    //Therefore this code can be removed and disassembled where necessary.
const Submission = require('../datasets/submissionModel');

module.exports.getProvideTo = function(req,res){

    const query = {
        "providers.provideruid":Number(req.query.studentuid)
    };

    Submission.find(query,{_id:0,studentuid:1})
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
    const query = {
        studentuid:req.query.studentuid
    };

    Submission.find(query)
        .then(function(response){
           res.status(200).send(response);
        });
};