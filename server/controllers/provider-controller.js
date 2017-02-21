/**
 * Created by adamellis on 09/02/2017.
 */

//This will be used exclusively for provider stuff
const Submission = require('../datasets/submissionModel');
const Form = require('../datasets/formModel');

module.exports.getSubmission = function(req,res){
    const sid = Number(req.query.sid);
    Submission.findOne({sid:sid})
        .then(function(response){
            res.status(200).send(response);
        })

};


module.exports.saveForm = function(req,res){
    const studentuid = Number(req.body.studentuid);
    const sid = Number(req.body.sid);
    const updatedJson = req.body.currentForm;
    Submission.findOneAndUpdate({"providers.provideruid":studentuid,sid:sid},{$set:{"providers.$.currentForm":updatedJson,"providers.$.provided":req.body.provided}})
        .then(function(response){
            res.status(200).send(response);
        })

};

module.exports.getForm = function(req,res){

    const query = {
        sid:Number(req.query.sid),
        "providers.provideruid":Number(req.query.studentuid)
    };
    Submission.findOne(query,{"providers.$.provideruid":1})
        .then(function(response){
            console.log(response);
            res.status(200).send(response);
        });
};