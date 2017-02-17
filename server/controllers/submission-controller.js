
//is this possible? - perhaps if one student submits many times
//how to deal? - inform student that they can only submit so many times to fix this?



const Submission = require('../datasets/submissionModel');

const sender = require('../send-request');

module.exports.createSubmission = function(req,res,next){
    res.status(200).send();

    //This bit needs refactoring too. It doesn't belong here.
    sender.sendMark(10, req.body.sid,function(err,res,body){
    });

    const html = "<iframe src='http://localhost:3050/#!/provider'></iframe>";
    sender.sendFeedback(html,req.body.sid,function(err,res,body){
    });
    const submission = new Submission(req.body);


    submission.save()
        .then(function(response){
            const allocationProcess = require('./allocation-process');
            allocationProcess.runAllocation(response);
        })
};

