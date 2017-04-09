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
        function getReceivers($stateParams, auth) {
            const authToken = window.btoa(`${auth.user}:${auth.token}`);
            return $http.get(`/api/allocations/receivers/${$stateParams.sid}`,
                {
                    headers: {
                        'Authorization': `Basic ${authToken}`
                    }
                });
        }

        //Get the student's providers
        function getProviders($stateParams, auth) {
            const authToken = window.btoa(`${auth.user}:${auth.token}`);
            return $http.get(`/api/allocations/providers/${$stateParams.sid}`,
                {
                    headers: {
                        'Authorization': `Basic ${authToken}`
                    }
                });
        }

        //setup for auth
        function getOneAllocation($stateParams, loadPattern) {
            const providerSid = $stateParams.providerSid;
            const receiverSid = $stateParams.receiverSid;
            let authToken =$stateParams.token;
            if (loadPattern === this.PROVIDER) {
                authToken = window.btoa(`${providerSid}:${authToken}`);
            } else if (loadPattern === this.RECEIVER) {
                authToken = window.btoa(`${receiverSid}:${authToken}`);
            } else {
                console.log("Select a loadPattern");
            }
            return $http.get(`/api/allocations/${receiverSid}/${providerSid}`, {
                headers: {
                    'Authorization': `Basic ${authToken}`
                }
            });
        }

        //Update a particular allocation.
        //do not need to auth academic
        function updateAllocation(receiverSid, providerSid, token, update) {
            const authToken = window.btoa(`${providerSid}:${token}`);
            return $http.put(`/api/allocations/${receiverSid}/${providerSid}`, update, {
                headers: {
                    'Authorization': `Basic ${authToken}`
                }
            });
        }


    }
}());

