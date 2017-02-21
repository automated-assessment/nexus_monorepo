/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback',['ui.router'])
        .config(function($stateProvider){
            $stateProvider
                .state('configState',{
                    url:'/config?aid',
                    templateUrl:'app/configuration/configuration.html',
                    controller:'configurationController'
                })
                .state('providerState',{
                    url:'/provider?sid?aid?studentuid',
                    templateUrl:'app/provider/provider.html',
                    controller:'providerController'
                })
                .state('allocationState',{
                    url:'/allocation?studentuid',
                    templateUrl:'app/allocation/allocation.html',
                    controller:'allocationController'
                })
                .state('receiverState',{
                    url:'/receiver?sid?studentuid',
                    templateUrl:'app/receiver/receiver.html',
                    controller:'receiverController'
                })
                .state('academicState',{
                    url:'/academic',
                    templateUrl:'app/academic/academic.html',
                    controller:'academicController'
                })
                .state('responseState',{
                    url:'/response',
                    templateUrl:'app/response/response.html',
                    controller:'responseController'
                })
        });
}());