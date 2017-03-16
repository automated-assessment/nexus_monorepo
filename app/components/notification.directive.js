/**
 * Created by adamellis on 23/02/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .directive('notification',['notificationService',function(notificationService){
           function link(scope){
               scope.notification = notificationService.get();
           }

           return {
               restrict:'E',
               link:link,
               scope: {},
               templateUrl:'app/layout/notification.html'
           }

        }]);
}());