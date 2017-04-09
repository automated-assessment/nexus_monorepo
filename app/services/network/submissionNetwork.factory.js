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
            getAssignmentSubmissions:getAssignmentSubmissions,
            getOneSubmission:getOneSubmission,
            getGitData:getGitData
        };

        //Get all submissions for aid
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
    }
}());