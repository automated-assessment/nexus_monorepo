/**
 * Created by adamellis on 17/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('allocationAPI',['$http',function($http){

            const getAllocation = function(studentuid,instruction){
                return $http(
                    {
                    method:'GET',
                    url:'/api/allocation/get'+instruction,
                    params:{
                        studentuid:studentuid
                    }
                })
            };

            return {
                getAllocation:getAllocation
            }
        }])
}());