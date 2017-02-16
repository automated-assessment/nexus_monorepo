/**
 * Created by adamellis on 09/02/2017.
 */

//This will be used exclusively for provider stuff
const Submission = require('../datasets/submissionModel');
const Form = require('../datasets/formModel');
module.exports.getSubmission = function(req,res){
    //console.log(req.query);
    Submission.find(req.query)
        .then(function(response){
            res.status(200).send(response);
        })

};

module.exports.getForm = function(req,res){
    Form.findOne(req.query)
        .then(function(response){
            console.log(response);
            res.status(200).send(response);
        })
};