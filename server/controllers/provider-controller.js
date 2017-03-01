/**
 * Created by adamellis on 09/02/2017.
 */

//This will be used exclusively for provider stuff
const Submission = require('../datasets/submissionModel');

module.exports.getSubmission = function(req,res){
    const query = {
        sid:Number(req.query.sid),
        "providers.providersid":Number(req.query.providersid)
    };
    Submission.findOne(query,{branch:1,"providers.$.provideruid":1})
        .then(function(response){
            res.status(200).send(response);
        });
};

module.exports.saveForm = function(req,res){
    const providersid = Number(req.body.providersid);
    const sid = Number(req.body.sid);
    const updatedJson = req.body.currentForm;
    const isProvided = req.body.provided;

    const query = {
        "providers.providersid":providersid,
        sid:sid
    };

    const update = {
        $set:{
            "providers.$.currentForm":updatedJson,
            "providers.$.provided":isProvided

        }
    };

    Submission.findOneAndUpdate(query,update)
        .then(function(response){
            res.status(200).send(response);
        })

};

