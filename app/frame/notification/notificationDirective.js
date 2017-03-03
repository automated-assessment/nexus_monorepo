/**
 * Created by adamellis on 23/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .directive('notification',['NotificationService',function(NotificationService){
           function link(scope,elem,attrs){
               scope.notification = NotificationService.getNotification();
           }

           return {
               restrict:'E',
               link:link,
               scope: {},
               templateUrl:'app/frame/notification/notification.html'
           }

        }]);
}());