/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider',function($stateProvider){
            $stateProvider
                .state('frameState.academicState',{
                    url:'/academic',
                    templateUrl:'app/views/academic/academic.html',
                    controller:'AcademicController as vm',
                    resolve:{
                        allSubmissions:allSubmissions
                    }
                });

            allSubmissions.$inject = ['submissionService'];

            function allSubmissions(submissionService){
                return submissionService.getAllSubmissions()
                    .then(function(response){
                        return response.data;
                    })
            }
        }]);
}());