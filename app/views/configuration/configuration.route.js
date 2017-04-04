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

            assignment.$inject = ['$stateParams','assignmentNetwork'];

            function assignment($stateParams,assignmentNetwork){
                if($stateParams.aid){
                    return assignmentNetwork.getOneAssignment($stateParams.aid)
                        .then(function(response){
                            if(response.data){
                                return response.data;
                            } else {
                                return {
                                    aid:$stateParams.aid,
                                    providerCount:2
                                };
                            }

                        });
                } else {
                    return {};
                }

            }
        }]);
}());