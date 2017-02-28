/**
 * Created by adamellis on 20/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('receiverAPI',['$http',function($http){
            const getFormPromise = function(sid, providersid){
                return $http({
                    method:'GET',
                    url:'/api/receiver/getForm',
                    params:{
                        sid:sid,
                        providersid:providersid
                    }
                });
            };

           return {
               getFormPromise:getFormPromise
           }
        }]);
}());