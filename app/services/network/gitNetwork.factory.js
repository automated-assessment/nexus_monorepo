/**
 * Created by adamellis on 03/04/2017.
 */
(function () {
    'use strict';

    angular
        .module('PeerFeedback')
        .factory('gitNetwork', gitNetwork);

    gitNetwork.$inject = ['$http'];

    function gitNetwork($http) {
        return {
            getGitSubmission:getGitSubmission
        };

        function getGitSubmission($stateParams,auth) {

            const authToken = btoa(`${auth.user}:${auth.token}`);
            return $http.get(`/api/git/${$stateParams.receiverSid}`,{
                headers:{
                    'Authorization':`Basic ${authToken}`
                }
            });
        }
    }

})();

