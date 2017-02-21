/**
 * Created by adamellis on 18/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('providerAPI',['$http',function($http){

            const querySubmission = function(sid){
                return $http({
                    method:'GET',
                    url: '/api/provider/getSubmission',
                    params :{
                        sid:sid
                    }

                })
            };


            const queryPartial = function(branchName){
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


            };

            const saveForm = function(submission){
                $http.post('/api/provider/saveForm',submission)
                    .then(function(response){
                        console.log("Complete");
                    })
            };


            const getPartial = function(sid) {
               return querySubmission(sid).then(function(response) {
                  return  queryPartial(response.data.branch)
                });
            };

            const getFormPromise = function(sid, studentuid){
                return $http({
                    method:'GET',
                    url:'/api/provider/getForm',
                    params:{
                        sid:sid,
                        studentuid:studentuid
                    }
                });
            };





            return {
                querySubmission:querySubmission,
                queryPartial:queryPartial,
                saveForm:saveForm,
                getPartial:getPartial,
                getFormPromise:getFormPromise
            }
        }]);
}());