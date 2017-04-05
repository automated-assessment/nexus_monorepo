/**
 * Created by adamellis on 14/03/2017.
 */

(function () {
    'use strict';

    angular
        .module('PeerFeedback')
        .factory('allocationNetwork', allocationNetwork);

    allocationNetwork.$inject = ['$http'];

    function allocationNetwork($http) {

        return {
            getReceivers: getReceivers,
            getProviders: getProviders,
            getOneAllocation: getOneAllocation,
            updateAllocation: updateAllocation,
            PROVIDER:"provider",
            RECEIVER:"receiver"
        };


        //Get the student's receivers
        function getReceivers(providerSid, hash) {
            const token = window.btoa(`${providerSid}:${hash}`);
            return $http.get(`/api/allocations/receivers/${providerSid}`,
                {
                    headers: {
                        'Authorization': `Basic ${token}`
                    }
                });
        }

        //Get the student's providers
        function getProviders(receiverSid, hash) {
            const token = window.btoa(`${receiverSid}:${hash}`);
            return $http.get(`/api/allocations/providers/${receiverSid}`,
                {
                    headers: {
                        'Authorization': `Basic ${token}`
                    }
                });
        }

        function getOneAllocation($stateParams, loadPattern) {
            const providerSid = $stateParams.providerSid;
            const receiverSid = $stateParams.receiverSid;
            const hash = $stateParams.hash;
            let token ="";
            if (loadPattern === this.PROVIDER) {
                token = window.btoa(`${providerSid}:${hash}`);
            } else if (loadPattern === this.RECEIVER) {
                token = window.btoa(`${receiverSid}:${hash}`);

            } else {
                console.log("Select a loadPattern");
            }
            return $http.get(`/api/allocations/${receiverSid}/${providerSid}`, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
        }

        //Update a particular allocation.
        function updateAllocation(receiverSid, providerSid, hash, update) {
            const token = window.btoa(`${providerSid}:${hash}`);
            return $http.put(`/api/allocations/${receiverSid}/${providerSid}`, update, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
        }


    }
}());

