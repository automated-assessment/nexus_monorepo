/**
 * Created by adamellis on 03/03/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('networkProvider',['$http',function($http){

            //needs to be extracted to env
            const authToken = "be7549b0fb2ad810c5b2a2a28376ecdac5d47f12";


            //Get all submissions
            const getAllSubmissions = function(){
                return $http.get('/api/submissions');
            };

            //Get all submissions for aid
            const getSubmissions = function(aid){
                return $http.get(`/api/submissions/${aid}`);
            };

            //Get the receiver's submission and corresponding providers.
            const getSubmissionReceivers = function(providersid){
                return $http.get(`/api/submissions/receivers/${providersid}`)
                    .then(function(response){
                        return response;
                    })
            };

            //Get the provider's submissions and corresponding receivers.
            const getSubmissionProviders = function(receiversid){
                return $http.get(`/api/submissions/providers/${receiversid}`)
                    .then(function(response){
                        return response;
                    })
            };

            const getSubmissionRelation = function(receiversid,providersid){
                return $http.get(`/api/submissions/providers/${receiversid}/${providersid}`)
                    .then(function(response){
                        return response;
                    })
            };

            //Update the provider's feedback form.
            const updateProviderForm = function(receiversid,providersid,data){
                return $http.put(`/api/submissions/providers/${receiversid}/${providersid}`,data);
            };

            const getAllAssignments = function(){
                return $http.get(`/api/assignments`);
            };

            const getOneAssignment = function(aid){
                return $http.get(`/api/assignments/${aid}`)
            };

            const updateAssignment = function(aid){
                return $http.put(`/api/assignments/${aid}`);
            };



            const getGitFile = function(aid,branch,path){
                return gitQuery(`/repos/NexusDevAdam/assignment-${aid}/contents/${path}`,{ref:branch});


            };

            const getGitTree = function(){
                //TODO
            };

            const getGitContent = function(aid, branch){
                return gitQuery(`/repos/NexusDevAdam/assignment-${aid}/contents`,{ref:branch})

            };
            //Git API Query


            const gitQuery = function(queryString,params){
                const url = "https://github.kcl.ac.uk/api/v3";
                params = params || {};
                return $http({
                    method: 'GET',
                    url: url + queryString,
                    headers: {
                        'Authorization': 'token ' + authToken,
                        'Accept': 'application/vnd.github.v3.html'
                    },
                    params:params
                })
                    .then(function(response){
                        return response;
                    })


            };





            return {
                getAllSubmissions:getAllSubmissions,
                getSubmissions:getSubmissions,
                getSubmissionProviders:getSubmissionProviders,
                getSubmissionReceivers:getSubmissionReceivers,
                getSubmissionRelation:getSubmissionRelation,
                updateProviderForm:updateProviderForm,
                getAllAssignments:getAllAssignments,
                getOneAssignment:getOneAssignment,
                updateAssignment:updateAssignment,
                getGitFile:getGitFile,
                getGitTree:getGitTree,
                getGitContent:getGitContent



            }



        }]);
}());