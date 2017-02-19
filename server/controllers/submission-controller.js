
//is this possible? - perhaps if one student submits many times
//how to deal? - inform student that they can only submit so many times to fix this?

const Submission = require('../datasets/submissionModel');
const responseController = require('./response-controller');

module.exports.createSubmission = function(req,res){
    res.status(200).send();
    console.log(req.body);
    responseController.response(req);

    const submission = new Submission(req.body);
    submission.save()
        .then(function(response){
            const allocationProcess = require('./allocation-process');
            allocationProcess.runAllocation(response);
        })

};


