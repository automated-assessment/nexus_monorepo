/**
 * Created by adamellis on 03/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .controller('AcademicController',AcademicController);

    AcademicController.$inject = ['allSubmissions','$http'];

    function AcademicController(allSubmissions,$http){
        const vm = this;
        vm.submissions = allSubmissions;

        $http.get('/api/test')
            .then(function(response){
                return response;
            })
    }
}());