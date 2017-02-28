/**
 * Created by adamellis on 16/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('receiverController',['$scope','$stateParams','receiverAPI',function($scope,$stateParams,receiverAPI){

           $scope.submission={};
           $scope.submission.sid = $stateParams.sid;
           $scope.submission.providersid = $stateParams.providersid;
           $scope.submission.aid = $stateParams.aid;






        }]);
}());