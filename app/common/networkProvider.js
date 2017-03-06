/**
 * Created by adamellis on 03/03/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('networkProvider',['$http','parser',function($http,parser){

            //needs to be extracted to env
            const authToken = "be7549b0fb2ad810c5b2a2a28376ecdac5d47f12";

            //Additional functions:
            const buildPartial = function(response){
                return response;
            };

            //Get all submissions
            const getAllSubmissions = function(){
                return $http.get('/api/submissions');
            };

            //Get all submissions for aid
            const getSubmissions = function(aid){
                return $http.get(`/api/submissions/${aid}`);
            };

            //Get the receiver's submission and corresponding providers.
            const getReceiverSubmissions = function(sid){
                return $http.get(`/api/submissions/receiver/${sid}`)
                    .then(function(response){
                        return parser.receiverSubmissions(response.data);
                    })
            };

            //Get the provider's submissions and corresponding receivers.
            const getProviderSubmissions = function(providersid){
                return $http.get(`/api/submissions/provider/${providersid}`)
                    .then(function(response){
                        return parser.providerSubmissions(response.data);
                    })
            };

            //Update the provider's feedback form.
            const updateProviderForm = function(sid,providersid){
                return $http.put(`/api/submissions/provider/${sid}/${providersid}`);
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









            //Git API Query
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





            return {
                getAllSubmissions:getAllSubmissions,
                getSubmissions:getSubmissions,
                getReceiverSubmissions:getReceiverSubmissions,
                getProviderSubmissions:getProviderSubmissions,
                updateProviderForm:updateProviderForm,
                getAllAssignments:getAllAssignments,
                getOneAssignment:getOneAssignment,
                updateAssignment:updateAssignment



            }



        }]);
}());