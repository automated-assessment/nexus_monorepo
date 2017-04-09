/**
 * Created by adamellis on 03/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .controller('AcademicController',AcademicController);

    AcademicController.$inject = ['$stateParams','assignmentSubmissions'];

    function AcademicController($stateParams,assignmentSubmissions){
        const vm = this;

        vm.email = $stateParams.email;
        vm.token = $stateParams.token;
        console.log(assignmentSubmissions);
        vm.submissions = assignmentSubmissions;
    }
}());