/**
 * Created by adamellis on 19/02/2017.
 */
(function(){
    //this could be extracted to a factory belonging to provider and receiver if this implementation works
    //they both share similar extraction methods
   angular.module('PeerFeedback')
       .factory('receiverAPI',['$http',function($http){


           return "Return here";
       }])
}());