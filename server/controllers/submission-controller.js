
//is this possible? - perhaps if one student submits many times
//how to deal? - inform student that they can only submit so many times to fix this?

const Submission = require('../datasets/submissionModel');
const responseController = require('./response-controller');
const allocationProcess = require('./allocation-process');

module.exports.createSubmission = function(req,res){
    res.status(200).send();
    responseController.response(req);

    const submission = new Submission(req.body);

    allocationProcess.runAllocation(submission);


};


