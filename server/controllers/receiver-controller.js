/**
 * Created by adamellis on 16/02/2017.
 */
const Submission = require('../datasets/submissionModel');


module.exports.getForm = function(req,res){
    console.log(req.query.providersid);
    const query = {
        sid:Number(req.query.sid),
        "providers.providersid":Number(req.query.providersid)
    };
    Submission.findOne(query,{"providers.$.providersid":1})
        .then(function(response){
            const disabledFormObject = disable(response);
            res.send(disabledFormObject);
        })
        .catch(function(err){
            res.send('Error');
        })
};


const disable = function(response){
    console.log(response);
    const form = JSON.parse(response.providers[0].currentForm);
    form.forEach(function(formElement){
        formElement.disabled="disabled";
    });
    response.providers[0].currentForm = JSON.stringify(form);
    return response;
};

