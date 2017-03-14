/**
 * Created by adamellis on 03/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .controller('AcademicController',AcademicController);

    AcademicController.$inject = ['allSubmissions'];

    function AcademicController(allSubmissions){
        const vm = this;
        vm.submissions = allSubmissions.data;
    }
}());