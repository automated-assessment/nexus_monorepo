/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback',['ui.router'])
        .config(function($stateProvider){
            $stateProvider
                .state('configState',{
                    url:'/config',
                    templateUrl:'app/configuration/configuration.html',
                    controller:'ConfigurationController'
                })
                .state('providerState',{
                    url:'/provider',
                    templateUrl:'app/provider/'
                })
        });
}());