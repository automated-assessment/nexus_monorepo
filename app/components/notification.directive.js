/**
 * Created by adamellis on 23/02/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .directive('notification',['notification',function(notification){
           function link(scope){
               scope.notification = notification.get();
           }

           return {
               restrict:'E',
               link:link,
               scope: {},
               templateUrl:'app/layout/notification.html'
           }

        }]);
}());