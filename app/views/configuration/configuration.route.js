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

            assignment.$inject = ['$stateParams','assignmentNetService'];

            function assignment($stateParams,assignmentNetService){
                if($stateParams.aid){
                    return assignmentNetService.getOneAssignment($stateParams.aid)
                        .then(function(response){
                            if(response.data){
                                return response.data;
                            } else {
                                return {
                                    aid:$stateParams.aid
                                };
                            }

                        });
                } else {
                    return {};
                }

            }
        }]);
}());