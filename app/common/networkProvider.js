/**
 * Created by adamellis on 03/03/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('networkProvider',['$http',function($http){

            //needs to be extracted to env
            const authToken = "be7549b0fb2ad810c5b2a2a28376ecdac5d47f12";


            //Additional functions:
            const buildPartial = function(response){
                return response;
            };

            //Academic
            const getAllSubmissions = function(){
                return $http.get('/api/academic/getAllSubmissions');
            };

            //Configuration
            const postAssignmentConfig = function(configForm){
                return $http.post('/api/configuration/postAssignmentConfig',configForm);
            };

            const getAssignmentConfig = function(aid){
                return $http.get('/api/configuration/getAssignmentConfig',{params:{aid:aid}})
            };

            //Allocation
            const getProvideTo = function(sid){
                return $http.get('/api/allocation/getProvideTo',{params:{sid:sid}});
            };
            const getReceivedFrom = function(sid){
                return $http.get('/api/allocation/getReceivedFrom',{params:{sid:sid}});

            };

            //Provider

            //This is responsible for locating the submission using the providersid and sid.
            const getSubmission = function(providersid,sid){
                return $http.get('/api/provider/getSubmission',{params:{providersid:providersid,sid,sid}});

            };

            //This is responsible for extracting the git partial
            const getGitPartial = function(branch,aid){
                const url = `https://github.kcl.ac.uk/api/v3/repos/NexusDevAdam/assignment-${aid}/contents`;
                return $http({
                    method: 'GET',
                    url: url,
                    headers: {
                        'Authorization': 'token ' + authToken,
                        'Accept': 'application/vnd.github.v3.html'
                    },
                    params:{
                        ref:'360d09519bcc6cfe6d5c327cdf8372bcdb1da311'
                    }
                })
                    .then(function(response){
                        return response;
                    })


            };

            const saveForm = function(submission){
                $http.post('/api/provider/saveForm',submission)
                    .then(function(response){
                        console.log("Complete");
                    })
            };



            return {
                postAssignmentConfig:postAssignmentConfig,
                getAssignmentConfig:getAssignmentConfig,
                getProvideTo:getProvideTo,
                getReceivedFrom:getReceivedFrom,
                getSubmission:getSubmission,
                getGitPartial:getGitPartial,
                saveForm:saveForm,
                getAllSubmissions:getAllSubmissions

            }



        }]);
}());