/**
 * Created by adamellis on 26/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('allocationAPI',['$http',function($http){

            const getProvideTo = function(sid){
                return $http({
                    method:"GET",
                    url:"/api/allocation/getProvideTo",
                    params:{
                        sid:sid
                    }
                })
            };
            const getReceivedFrom = function(sid){
                return $http({
                    method:"GET",
                    url:"/api/allocation/getReceivedFrom",
                    params:{
                        sid:sid
                    }
                })
            };
            return {
                getProvideTo:getProvideTo,
                getReceivedFrom:getReceivedFrom

            }
        }])
}());