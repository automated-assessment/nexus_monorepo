/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider',function($stateProvider){
            $stateProvider
                .state('frameState.academicState',{
                    url:'/academic?token?email',
                    templateUrl:'app/views/academic/academic.html',
                    controller:'AcademicController as vm',
                    resolve:{
                        allSubmissions:allSubmissions
                    }
                });

            allSubmissions.$inject = ['submissionNetwork'];

            function allSubmissions(submissionNetwork){
                return submissionNetwork.getAllSubmissions()
                    .then(function(response){
                        return response.data;
                    })
            }
        }]);
}());