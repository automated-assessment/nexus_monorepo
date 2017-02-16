/**
 * Created by adamellis on 06/02/2017.
 */
//Need to refactor this so that it accounts for differing file names and folders.
//Will need to recursively extract data from repository.

(function(){
   angular.module('PeerFeedback')
       .factory('GithubRetrievalFactory',['$http',function($http) {
           const apiCall = {};

           apiCall.getPartial = function(branchName){
            if(branchName) {
                const authToken = "be7549b0fb2ad810c5b2a2a28376ecdac5d47f12"; //needs to be extracted to env
                const baseUrl = "https://github.kcl.ac.uk/api/v3/repos/NexusDevAdam";

                return $http({
                    method: 'GET',
                    url: baseUrl + '/assignment-1/contents/File1.java',
                    headers: {
                        'Authorization': 'token ' + authToken,
                        'Accept': 'application/vnd.github.v3.html'
                    },
                    params: {
                        ref: branchName
                    }
                });
            }
           };
           return apiCall;
       }]);
})();


// /:repo/contents/:fileName

