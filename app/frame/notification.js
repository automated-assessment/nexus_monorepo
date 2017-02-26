/**
 * Created by adamellis on 23/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .directive('notification',function(){
           function link(scope,elem,attrs){
                scope.notification = {};
                scope.notification.display=false;
                scope.listener = function(text,type){
                    scope.notification={
                        display:true,
                        text:text,
                        type:type
                    }
                };
           }

           return {
               restrict:'E',
               link:link,
               scope:{listener:'='},
               templateUrl:'app/frame/notification.html'
           }

        });
}());