/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider',function($stateProvider){
            $stateProvider
                .state('frameState.academicState',{
                    url:'/academic?aid?token?email',
                    templateUrl:'app/views/academic/academic.html',
                    controller:'AcademicController as vm',
                    resolve:{
                        assignmentSubmissions:assignmentSubmissions
                    }
                });

            assignmentSubmissions.$inject = ['$stateParams','submissionNetwork'];

            function assignmentSubmissions($stateParams,submissionNetwork){
                const auth = {
                    user:$stateParams.aid,
                    token:$stateParams.token
                };

                return submissionNetwork.getAssignmentSubmissions($stateParams,auth)
                    .then(function(response){
                        return response.data;
                    })

            }
        }]);
}());