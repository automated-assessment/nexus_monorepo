/**
 * Created by adamellis on 22/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .service('responseService',function(){
            this.speak = function(){
                return "Hello from service";
            }
        });
}());