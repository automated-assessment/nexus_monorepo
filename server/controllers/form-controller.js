/**
 * Created by adamellis on 20/02/2017.
 */

const Submission = require('../datasets/submissionModel');


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