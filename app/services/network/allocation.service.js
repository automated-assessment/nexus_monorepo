/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .factory('allocationService',allocationService);

    allocationService.$inject = ['$http'];

    function allocationService($http){

        return {
            getReceivers:getReceivers,
            getProviders:getProviders,
            getAllocation:getAllocation,
            updateAllocation:updateAllocation
        };


        //Get the student's receivers
        function getReceivers(providerSid){
            return $http.get(`/api/allocations/receivers/${providerSid}`);
        }

        //Get the student's providers
        function getProviders(receiverSid){
            return $http.get(`/api/allocations/providers/${receiverSid}`);
        }

        function getAllocation(receiverSid,providerSid){
            return $http.get(`/api/allocations/${receiverSid}/${providerSid}`);
        }

        //Update a particular allocation.
        function updateAllocation(receiverSid,providerSid,update){
            return $http.put(`/api/allocations/${receiverSid}/${providerSid}`,update);
        }


    }
}());

