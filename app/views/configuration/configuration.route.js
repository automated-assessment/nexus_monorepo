/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider',function($stateProvider){
            $stateProvider
                .state('frameState.configurationState',{
                    url:'/configuration?aid',
                    templateUrl:'app/views/configuration/configuration.html',
                    controller:'ConfigurationController as vm',
                    resolve:{
                        assignment:assignment
                    }
                });

            assignment.$inject = ['$stateParams','assignmentService','providerCounts'];

            function assignment($stateParams,assignmentService,providerCounts){
                return assignmentService.getOneAssignment($stateParams.aid)
                    .then(function(response){
                        assignment = {
                            aid:$stateParams.aid,
                            dateCreated:new Date(),
                            formBuild:response.data.formBuild,
                            providerCount:response.data.providerCount || providerCounts[0]
                        };
                        return assignment;

                    });
            }
        }]);
}());