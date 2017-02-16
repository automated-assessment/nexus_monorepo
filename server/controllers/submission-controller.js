//Should be used exclusively for submission

//This needs refactoring.
// The creating a submission is a promise and should be extracted as such.

//using providerCount as minAllocationCounter and number to provide to. split this, they have two purposes.

//need to ensure that student doesnt get same submission twice


//need to store when no allocation spots
//is this possible? - perhaps if one student submits many times
//how to deal? - inform student that they can only submit so many times to fix this?



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
        .then(submissionPromise)


};






var submissionPromise = function(response){

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
                receiver.studentpid.length <= minPid(submissionData)){
                receiver.studentpid.push(provider.studentuid);
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
        pidLengths.push(submissionData[submission].studentpid.length);
    }
    return Math.min(...pidLengths);
};

