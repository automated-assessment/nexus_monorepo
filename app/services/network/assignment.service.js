/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .factory('assignmentService',assignmentService);

    assignmentService.$inject = ['$http'];

    function assignmentService($http){

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