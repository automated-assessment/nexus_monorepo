/**
 * Created by adamellis on 22/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('responseFactory',function(){
           const speak = function(){
               return "Hello from factory";
           };

           return {
               speak:speak
           }

        });
}());