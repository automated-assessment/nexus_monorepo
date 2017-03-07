/**
 * Created by adamellis on 21/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('allocationController',['allocation',function(allocation){

           const vm = this;
           vm.sid = allocation.sid;
           vm.aid = allocation.aid;
           vm.student = allocation.student;
           vm.provideTo = allocation.receivers;
           vm.receivedFrom = allocation.providers;






        }]);
}());