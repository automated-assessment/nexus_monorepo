/**
 * Created by adamellis on 23/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('frameController',['$rootScope','NotificationService',function($rootScope,NotificationService){

            $rootScope.$on('$stateChangeStart',function(event){
               NotificationService.hideNotification();
            });

        }]);
}());