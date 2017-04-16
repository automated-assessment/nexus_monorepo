/**
 * Created by adamellis on 04/04/2017.
 */
(function () {
    'use strict';

    angular
        .module('PeerFeedback')
        .factory('allocationDisplay', allocationDisplay);


    /* @ngInject */

    allocationDisplay.$inject = ['assignmentNetwork'];

    function allocationDisplay(assignmentNetwork) {
        return {
            getDisplay: getDisplay,
            hasProvided: hasProvided,
            hasReceived: hasReceived
        };


        function getDisplay(submission) {
            if(submission.receivedFrom){
                const receiverSid = submission.core.sid;
                console.log(submission.core.aid);
                assignmentNetwork.getOneAssignment(submission.core.aid)
                    .then(function(response){
                        console.log(response);
                        const awaitBiDirection = response.data.additionalConfiguration.awaitBiDirection;
                        if(awaitBiDirection){
                            submission.receivedFrom.forEach(function (provider) {
                                provider.display = hasProvided(submission, receiverSid,provider.providerSid)
                                    && hasReceived(submission, receiverSid, provider.providerSid);
                            });
                        } else {
                            submission.receivedFrom.forEach(function (provider) {
                                provider.display = hasReceived(submission, receiverSid, provider.providerSid);
                            });
                        }
                    })
            }
        }

        function hasProvided(submission, receiverSid, providerSid) {
            console.log(receiverSid);
            for (let i = 0; i < submission.provideTo.length; i++) {
                if (submission.provideTo[i].providerSid == receiverSid
                    && submission.provideTo[i].receiverSid == providerSid) {
                    return submission.provideTo[i].provided;
                }
            }
        }

        function hasReceived(submission, receiverSid, providerSid) {
            for (let i = 0; i < submission.receivedFrom.length; i++) {
                if (submission.receivedFrom[i].providerSid == providerSid && submission.receivedFrom[i].receiverSid == receiverSid) {
                    return submission.receivedFrom[i].provided;
                }
            }
        }

    }


})();

