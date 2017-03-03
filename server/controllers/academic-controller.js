/**
 * Created by adamellis on 03/03/2017.
 */

const Submission = require('../datasets/submissionModel');

module.exports.getAllSubmissions = function(req,res){
    Submission.find()
        .then(function(response){
            res.send(response);
        })
};