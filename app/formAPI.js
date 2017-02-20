/**
 * Created by adamellis on 20/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('formAPI',['$http',function($http){
            const getFormPromise = function(sid, studentuid){
                return $http({
                    method:'GET',
                    url:'/api/form/getForm',
                    params:{
                        sid:sid,
                        studentuid:studentuid
                    }
                });
            };
            return {
                getFormPromise:getFormPromise
            }
        }])
}());