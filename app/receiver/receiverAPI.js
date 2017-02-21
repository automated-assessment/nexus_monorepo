/**
 * Created by adamellis on 20/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('receiverAPI',['$http',function($http){
            const getFormPromise = function(sid, studentuid){
                return $http({
                    method:'GET',
                    url:'/api/receiver/getForm',
                    params:{
                        sid:sid,
                        studentuid:studentuid
                    }
                });
            };

           return {
               getFormPromise:getFormPromise
           }
        }]);
}());