//Used exclusively in the allocation process

//This needs refactoring.
// The creating a submission is a promise and should be extracted as such.

const Submission = require('../datasets/submissionModel');
const Form = require('../datasets/formModel.js');
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
        .then(callback)


};






var callback = function(response){

    Form.find({aid:response.aid},function(err,formData){
        const providerTotal = formData[0].providerCount;
        const minAllocationCount = formData[0].providerCount;
        Submission.find({aid:response.aid},function(err,submissionData){

            if(submissionData.length > minAllocationCount){
                assign(providerTotal,submissionData);
            }


        });
    });
};


const assign = function(providerTotal, submissionData){
    assignment(0);
    function assignment(i){
        if(i<providerTotal) {
            const provider = randomStudent(submissionData);
            const receiver = randomStudent(submissionData);
            if((receiver.studentuid !== provider.studentuid) &&
                receiver.pid.length <= minPid(submissionData)){
                receiver.pid.push(provider.studentuid);
                receiver.save()
                    .then(function(response,err){
                        assignment(++i);
                    });
            } else {
                assignment(i);
            }
        }
    }
};

const randomStudent = function(submissionData){
    const submissionsLength = submissionData.length;
    const studentIndex = Math.round(Math.random()*(submissionsLength-1));
    return submissionData[studentIndex];

};



const minPid = function(submissionData){
    const pidLengths =[];
    for(let submission in submissionData){
        pidLengths.push(submissionData[submission].pid.length);
    }
    return Math.min(...pidLengths);
};

