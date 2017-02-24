/**
 * Created by adamellis on 17/02/2017.
 */
(function(){
   angular.module('PeerFeedback')
       .factory('configurationAPI',['$http',function($http){
           const postForm = function(configForm){
               return $http.post('/api/configuration/saveForm',configForm);
           };

           return {
                postForm:postForm
           }
       }])
}());