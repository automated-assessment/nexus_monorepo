var Submission = require('../datasets/submissionModel');

module.exports.createSubmission = function(req,res){
    var submission = new Submission(req.body);
    submission.save(allocation);
    res.json(req.body);

};

var allocation = function(err, submission){
    Submission.find(function(err,foundData){
        Submission.count(function(err,count){
            console.log(foundData);
            var randomNumber = Math.round((Math.random()*(count-1)));
            console.log(foundData[randomNumber].branch + "vs " +submission.branch);
            console.log(foundData[randomNumber].sid);
            submission.pid.push(foundData[randomNumber].sid);
            console.log(submission.pid);

            console.log();
            if(submission.branch !== foundData[randomNumber].branch ) { //Check that receiver != provider
                submission.pid.push(foundData[randomNumber].sid);
                console.log("Pid pushed");
                submission.update();
            }
        });
    })
};

