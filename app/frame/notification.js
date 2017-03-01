/**
 * Created by adamellis on 23/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .directive('notification',['$anchorScroll',function($anchorScroll){
           function link(scope,elem,attrs){
                scope.notification = {};
                scope.notification.display=false;
                scope.listener = function(text,type){
                    scope.notification={
                        display:true,
                        text:text,
                        type:type
                    };
                    $anchorScroll();

                };
                scope.hide = function(){
                    if(scope.notification){
                        scope.notification.display = false;
                    }
                }
           }

           return {
               restrict:'E',
               link:link,
               scope:
                   {
                       listener:'=',
                       hide:'='
                   },
               templateUrl:'app/frame/notification.html'
           }

        }]);
}());