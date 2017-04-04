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

        function getGitSubmission(receiverSid) {
            return $http.get(`/api/git/${receiverSid}`);
        }
    }

})();

