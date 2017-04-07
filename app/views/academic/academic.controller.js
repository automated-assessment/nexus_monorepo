/**
 * Created by adamellis on 03/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .controller('AcademicController',AcademicController);

    AcademicController.$inject = ['$stateParams','allSubmissions','$http','gitNetwork'];

    function AcademicController($stateParams,allSubmissions,$http,gitNetwork){
        const vm = this;
        vm.submissions = allSubmissions;

        vm.email = $stateParams.email;
        vm.token = $stateParams.token;
    }
}());