/**
 * Created by adamellis on 16/02/2017.
 */
const Submission = require('../datasets/submissionModel');


module.exports.getForm = function(req,res){

    const query = {
        sid:Number(req.query.sid),
        "providers.provideruid":Number(req.query.studentuid)
    };
    Submission.findOne(query,{"providers.$.provideruid":1})
        .then(function(response){
            const disabledFormObject = disable(response);
            res.status(200).send(disabledFormObject);
        });
};


const disable = function(response){
    const form = JSON.parse(response.providers[0].currentForm);
    form.forEach(function(formElement){
        formElement.disabled="disabled";
    });
    response.providers[0].currentForm = JSON.stringify(form);
    return response;
};

