/**
 * Created by adamellis on 03/03/2017.
 */

const Assignment = require('../datasets/assignmentModel');
const submissionsController = require('./submissions-controller');
const responseUtils = require('../utilities/response-utils');
module.exports.getAllAssignments = function(req,res){
    Assignment.find({})
        .then(function(response){
            res.send(response);
        });
};

module.exports.getOneAssignment =  function(req,res){

    const query={
        aid:req.params.aid
    };

    exports.queryAssignment(query)
        .then(function(response){
            res.send(response);
        })
};

module.exports.queryAssignment = function(query){
    return Assignment.findOne(query);
};

module.exports.updateAssignment = function(req,res){

    console.log(req.body);
    const query = {
        aid:req.params.aid
    };

    const update = req.body;

    const options = {
        upsert:true,
        new:true
    };

    Assignment.findOneAndUpdate(query,update,options)
        .then(function(response){
            console.log(response);
            resendResponse(response);
            res.send(response);

    });
};

function resendResponse(assignment){
    submissionsController.queryAssignmentSubmissions({aid:assignment.aid})
        .then(function(submissions){
            for(let i=0;i<submissions.length;i++){
                submissionsController.queryUpdateOneSubmission({sid:submissions[i].sid},{academicEmail:assignment.email})
                responseUtils.sendResponse(submissions[i],assignment);
            }
        })
}

