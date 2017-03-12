/**
 * Created by adamellis on 21/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('allocationController',['submissionCore','submissionReceivers','submissionProviders',
            function(submissionCore,submissionReceivers,submissionProviders){

           const vm = this;

           console.log(submissionCore.data);
           console.log(submissionReceivers.data);
           console.log(submissionProviders.data);
            vm.submission = {
                core:submissionCore,
                provideTo:submissionReceivers,
                receivedFrom:submissionProviders
            };

           // vm.allocation = allocation;
           // vm.sid = allocation.sid;
           // vm.aid = allocation.aid;
           // vm.dateCreated = allocation.dateCreated;
           // vm.student = allocation.student;
           // vm.provideTo = allocation.receivers;
           // vm.receivedFrom = allocation.providers;





        }]);
}());