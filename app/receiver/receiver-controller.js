/**
 * Created by adamellis on 16/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('ReceiverController',function($scope,$stateParams,$http){
           $scope.submission={};
           $scope.sid = $stateParams.sid;
           $scope.studentuid = $stateParams.studentuid;

           $scope.getFormPromise = function(){
               return $http({
                   method:'GET',
                   url:'/api/receiver/getForm',
                   params: {
                       sid:$stateParams.sid,
                       studentuid:$stateParams.studentuid
                   }
               })
           }
        });
}());