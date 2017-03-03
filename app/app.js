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
                        allSubmissions:['$http',function($http){
                            return $http.get('/api/academic/getAllSubmissions')
                                .then(function(response){
                                    return response.data;
                                })
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
                            return networkProvider.getAssignmentConfig($stateParams.aid)
                                .then(function (response) {
                                    return response.data;
                                })
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
                    templateUrl:'app/provider/provider.html',
                    controller:'providerController'
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