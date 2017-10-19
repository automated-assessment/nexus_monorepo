/**
 * Created by adamellis on 14/03/2017.
 */

(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
            $stateProvider
                .state('frameState',{
                    url:'/frame',
                    templateUrl:'app/layout/frame.html',
                    controller:'frameController'
                });

            $urlRouterProvider.otherwise('/frame');
        }]);
}());