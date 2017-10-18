/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .factory('submissionNetwork',submissionNetwork);

    submissionNetwork.$inject = ['$http'];

    function submissionNetwork($http){

        return {
            getReceivers: getReceivers,
            getProviders: getProviders,
            getAssignmentSubmissions:getAssignmentSubmissions,
            getOneSubmission:getOneSubmission,
            getGitData:getGitData
        };

        function getAssignmentSubmissions($stateParams,auth){
            const authToken = window.btoa(`${auth.user}:${auth.token}`);
            return $http.get(`/api/assignments/${$stateParams.aid}/submissions`,{
                headers:{
                    'Authorization':`Basic ${authToken}`
                }
            });
        }

        function getOneSubmission($stateParams,auth){
           const authToken = window.btoa(`${auth.user}:${auth.token}`);
            return $http.get(`/api/submissions/${$stateParams.sid}`,{
                headers:{
                    'Authorization':`Basic ${authToken}`
                }
            });
        }

        function getGitData(sid){
            return $http.get(`/api/submissions/${sid}/git`);
        }

        function getReceivers($stateParams, auth) {
            const authToken = window.btoa(`${auth.user}:${auth.token}`);
            return $http.get(`/api/submissions/receivers/${$stateParams.sid}`,
                {
                    headers: {
                        'Authorization': `Basic ${authToken}`
                    }
                })
                .then(function(response){
                    return response;
                })

        }


        function getProviders($stateParams, auth) {
            const authToken = window.btoa(`${auth.user}:${auth.token}`);
            return $http.get(`/api/submissions/providers/${$stateParams.sid}`,
                {
                    headers: {
                        'Authorization': `Basic ${authToken}`
                    }
                });
        }
    }
}());