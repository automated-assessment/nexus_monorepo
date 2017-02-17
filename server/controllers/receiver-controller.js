/**
 * Created by adamellis on 16/02/2017.
 */
const Submission = require('../datasets/submissionModel');


module.exports.getForm = function(req,res){
    const query = {
        sid:Number(req.query.sid),
        "providers.provideruid":Number(req.query.studentuid)
    };
    Submission.findOne(query,{"providers.$.no":1})
        .then(function(response){
            res.status(200).send(response);
        });
};