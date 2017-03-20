/**
 * Created by adamellis on 14/03/2017.
 */

(function(){
    'use strict';

    angular
        .module('PeerFeedback')
        .factory('allocationNetwork',allocationNetwork);

    allocationNetwork.$inject = ['$http'];

    function allocationNetwork($http){

        return {
            getReceivers:getReceivers,
            getProviders:getProviders,
            getOneAllocation:getOneAllocation,
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

        function getOneAllocation(receiverSid,providerSid){
            return $http.get(`/api/allocations/${receiverSid}/${providerSid}`);
        }

        //Update a particular allocation.
        function updateAllocation(receiverSid,providerSid,update){
            return $http.put(`/api/allocations/${receiverSid}/${providerSid}`,update);
        }

        //TODO: Return whether bidirectional ready to display if so configured by academic


    }
}());

