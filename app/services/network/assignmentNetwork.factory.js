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

        function updateAssignment(aid,data){
            return $http.put(`/api/assignments/${aid}`,data);
        }

    }
}());