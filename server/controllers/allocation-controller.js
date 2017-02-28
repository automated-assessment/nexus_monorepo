/**
 * Created by adamellis on 17/02/2017.
 */
const Submission = require('../datasets/submissionModel');

//Retrieve the submissions that this student has to provide to based on their sid
module.exports.getProvideTo = function(req,res){
    const query = {
        "providers.providersid":Number(req.query.sid)
    };

    const projection = {
        _id:0,
        aid:1,
        student:1,
        sid:1,
        "providers.$.providersid":1
    };
    Submission.find(query,projection)
        .then(function(response){
            res.send(response);
        })
        .catch(function(){
            res.sendStatus(400);
        })
};

//Retrieve what this student has received for their submission, i.e. the forms
module.exports.getReceivedFrom = function(req,res){
    const query = {
        sid:Number(req.query.sid)
    };

    Submission.findOne(query)
        .then(function(response){
            res.send(response);
        })
        .catch(function(){
            res.sendStatus(400);
        })

};








