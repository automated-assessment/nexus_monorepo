/**
 * Created by adamellis on 16/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('ReceiverController',['$scope','$stateParams','receiverAPI',function($scope,$stateParams,receiverAPI){
           $scope.submission={};
           $scope.sid = $stateParams.sid;
           $scope.studentuid = $stateParams.studentuid;

           $scope.getFormPromise = function(){
               return receiverAPI.getFormPromise($stateParams.sid,$stateParams.studentuid);
           }

        }]);
}());