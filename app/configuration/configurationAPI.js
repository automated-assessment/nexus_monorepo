/**
 * Created by adamellis on 17/02/2017.
 */
(function(){
   angular.module('PeerFeedback')
       .factory('configurationAPI',['$http',function($http){

           const postForm = function(configForm){
               $http.post('/api/config/save',configForm);
           };

           return {
                postForm:postForm
           }
       }])
}());