/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback',['ui.router'])

        .config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
            $stateProvider
                .state('frameState',{
                    url:'/frame',
                    templateUrl:'app/frame/frame.html',
                    controller:'frameController'
                })
                .state('frameState.academicState',{
                    url:'/academic',
                    templateUrl:'app/academic/academic.html',
                    controller:'academicController as vm',
                    resolve:{
                        allSubmissions:['networkProvider',function(networkProvider){
                            return networkProvider.getAllSubmissions()
                                .then(function(response){
                                    return response;
                                });
                        }]
                    }
                })
                .state('frameState.allocationState',{
                    url:'/allocation?sid',
                    templateUrl:'app/allocation/allocation.html',
                    controller:'allocationController'
                })
                .state('frameState.configurationState',{
                    url:'/configuration?aid',
                    templateUrl:'app/configuration/configuration.html',
                    controller:'configurationController as vm',
                    resolve:{
                        loadAssignment:['networkProvider','$stateParams',function(networkProvider,$stateParams) {
                            if ($stateParams.aid) {
                                return networkProvider.getOneAssignment($stateParams.aid)
                                    .then(function (response) {
                                        return response;
                                    })
                            }
                        }],
                        assignmentConfig:['loadAssignment','$stateParams',function(loadAssignment,$stateParams){
                            const assignment = {
                                providerCounts:[2,3,4,5,6,7,8],
                                config:{
                                    aid:$stateParams.aid,
                                    dateCreated:new Date(),
                                    dateModified:new Date(),
                                    formBuild:""
                                }
                            };
                            assignment.config.providerCount = assignment.providerCounts[0];

                            //If there is a pre-existing assignment
                            if(loadAssignment && loadAssignment.data) {
                                assignment.config.formBuild = loadAssignment.data.formBuild;
                                assignment.config.providerCount = loadAssignment.data.providerCount;
                            }
                            return assignment;

                        }]

                    }
                })
                .state('frameState.providerState',{
                    url:'/provider',
                    controller:'providerController as vm',
                    params:{
                        aid:null,
                        providersid:null,
                        sid:null
                    },
                    templateUrl:'app/provider/provider.html'
                })
                .state('frameState.receiverState',{
                    url:'/receiver',
                    params:{
                        aid:null,
                        providersid:null,
                        sid:null
                    },
                    templateUrl:'app/provider/receiver.html',
                    controller:'receiverController'
                });
                $urlRouterProvider.otherwise('/frame');
        }]);
}());