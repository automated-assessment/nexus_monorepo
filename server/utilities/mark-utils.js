/**
 * Created by adamellis on 05/04/2017.
 */

const submissionsController = require('../controllers/submissions-controller');
const assignmentsController = require('../controllers/assignments-controller');
const allocationsController = require('../controllers/allocations-controller');
const responseUtils = require('../utilities/response-utils');

module.exports.updateMark = function (allocation) {
    submissionsController.queryOneSubmission({sid: allocation.receiverSid})
        .then(function (submission) {
            assignmentsController.queryAssignment({aid: submission.aid})
                .then(function (assignment) {
                    if(assignment.additionalConfiguration.contributeFinalMark){
                        const providerCount = assignment.providerCount;
                        allocationsController.queryProviders({receiverSid: submission.sid})
                            .then(function (allocation) {
                                const mark = checkAndCalculate(allocation.providers,providerCount);
                                if(typeof mark === "number"){
                                    responseUtils.sendMark(mark,submission.sid)
                                        .then(function(response){
                                            console.log(response);
                                        })
                                }
                            });
                    }

                })
        })
};




function checkAndCalculate(providers, providerCount) {

    if (providerCount !== providers.length) {
        return;
    }
    for(let i=0;i<providers.length;i++){
        if(providers[i].provided === false){
            return;
        }
    }

    let total = 0;
    for(let i=0;i<providers.length;i++){
        total += providers[i].providerMark;
    }
    return total/providerCount;
}
