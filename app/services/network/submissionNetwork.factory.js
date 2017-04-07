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
            getAllSubmissions:getAllSubmissions,
            getAssignmentSubmissions:getAssignmentSubmissions,
            getOneSubmission:getOneSubmission,
            getGitData:getGitData
        };

        //Get all submissions
        function getAllSubmissions(){
            return $http.get('/api/submissions');
        }

        //Get all submissions for aid
        function getAssignmentSubmissions(aid){
            return $http.get(`/api/assignments/${aid}/submissions`);
        }

        function getOneSubmission(sid,token){
           const authToken = window.btoa(`${sid}:${token}`);
            return $http.get(`api/submissions/${sid}`,{
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