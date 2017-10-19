/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    'use strict';

    angular
        .module('PeerFeedback')
        .factory('assignmentNetwork',assignmentNetwork);

    assignmentNetwork.$inject = ['$http'];

    function assignmentNetwork($http){

        return {
            getAllAssignments:getAllAssignments,
            getOneAssignment:getOneAssignment,
            updateAssignment:updateAssignment
        };


        function getAllAssignments(){
            return $http.get(`/api/assignments`);
        }

        function getOneAssignment(aid){
            return $http.get(`/api/assignments/${aid}`)
        }

        function updateAssignment($stateParams,auth,assignmentData){
            const authToken = window.btoa(`${auth.user}:${auth.token}`);
            return $http.put(`/api/assignments/${$stateParams.aid}`,assignmentData,
                {
                    headers: {
                        'Authorization': `Basic ${authToken}`
                    }
                })

        }


    }
}());