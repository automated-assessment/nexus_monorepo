/**
 * Created by adamellis on 16/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('receiverController',['$scope','$stateParams',function($scope,$stateParams){
           $scope.submission={};
           $scope.submission.sid = $stateParams.sid;
           $scope.submission.studentuid = $stateParams.studentuid;


        }]);
}());