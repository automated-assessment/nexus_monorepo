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

            getOneAllocation: getOneAllocation,
            updateAllocation: updateAllocation,
            PROVIDER:"provider",
            RECEIVER:"receiver"
        };

        function getOneAllocation($stateParams, auth) {
            const authToken = window.btoa(`${auth.user}:${auth.token}`);
            return $http.get(`/api/allocations/${$stateParams.receiverSid}/${$stateParams.providerSid}`, {
                headers: {
                    'Authorization': `Basic ${authToken}`
                }
            });
        }


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

