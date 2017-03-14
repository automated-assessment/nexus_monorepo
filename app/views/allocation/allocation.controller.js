/**
 * Created by adamellis on 21/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('AllocationController',['submission','receivers','providers',
            function(submission,receivers,providers){

           const vm = this;


            vm.submission = {
                core:submission.data,
                provideTo:receivers.data,
                receivedFrom:providers.data
            };





        }]);
}());