/**
 * Created by adamellis on 17/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('allocationAPI',['$http',function($http){

            const getAllocation = function(stateParams,instruction){
                return $http({
                    method:'GET',
                    url:'/api/allocation/get'+instruction,
                    params:{
                        aid:stateParams.aid,
                        studentuid:stateParams.studentuid
                    }
                })
            };
            return {
                getAllocation:getAllocation
            }
        }])
}());