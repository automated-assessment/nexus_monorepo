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
                    url:'/allocation?sid?aid',
                    templateUrl:'app/allocation/allocation.html',
                    controller:'allocationController as vm',
                    resolve:{
                        submissionReceivers:['networkProvider','$stateParams',function(networkProvider,$stateParams) {
                            if($stateParams.sid){
                                return networkProvider.getSubmissionReceivers($stateParams.sid)
                                    .then(function(response){
                                        return response;
                                    })
                            }


                        }],
                        submissionProviders:['networkProvider','$stateParams',function(networkProvider,$stateParams){
                            if($stateParams.sid){
                                return networkProvider.getSubmissionProviders($stateParams.sid)
                                    .then(function(response){
                                        return response;
                                    })
                            }
                        }],
                        allocation:['submissionReceivers','submissionProviders','$stateParams',function(submissionReceivers,submissionProviders,$stateParams){
                            const allocation = {
                                sid:$stateParams.sid,
                                aid:$stateParams.aid
                            };

                            if(submissionReceivers){
                                allocation.receivers = submissionReceivers.data;
                            }
                            if(submissionProviders){
                                allocation.providers=submissionProviders.data;
                                allocation.student = submissionProviders.data.student;
                                allocation.dateCreated = submissionProviders.data.dateCreated;
                            }
                            return allocation;
                        }]


                    }
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
                    params:{
                        providersid:null,
                        receiversid:null,
                        aid:null,
                        alias:null
                    },
                    controller:'providerController as vm',
                    templateUrl:'app/provider/provider.html',
                    resolve:{ //refactor this with receiverState resolver
                        providerForm:['$stateParams','networkProvider',function($stateParams,networkProvider){
                            const form = {
                                currentForm:""
                            };
                            if($stateParams.receiversid && $stateParams.providersid){
                                return networkProvider.getSubmissionRelation($stateParams.receiversid,$stateParams.providersid)
                                    .then(function(response){
                                        form.currentForm = response.data.currentForm;
                                        form.provided = response.data.provided; //is this necessary?
                                        return form;
                                    });
                            } else {
                                return form;
                            }

                        }]
                    }
                })
                .state('frameState.receiverState',{
                    url:'/receiver',
                    params:{
                        providersid:null,
                        receiversid:null,
                        aid:null,
                        alias:null
                    },
                    templateUrl:'app/receiver/receiver.html',
                    controller:'receiverController as vm',
                    resolve:{
                        receivedForm:['$stateParams','networkProvider',function($stateParams, networkProvider){
                            const form = {};
                            networkProvider.getSubmissionRelation($stateParams.receiversid,$stateParams.providersid)
                                .then(function(response){
                                    form.currentForm =response.data.currentForm;
                                    form.provided = response.data.provided;
                                });

                            return form;
                        }]
                    }
                });
                $urlRouterProvider.otherwise('/frame');
        }]);
}());