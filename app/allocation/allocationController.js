/**
 * Created by adamellis on 21/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('allocationController',['$scope','allocationAPI','$stateParams',function($scope,allocationAPI,$stateParams){

            if($stateParams.sid){
                allocationAPI.getProvideTo($stateParams.sid)
                    .then(function(response){
                        $scope.provideTo = response.data;

                    });
                allocationAPI.getReceivedFrom($stateParams.sid)
                    .then(function(response){
                        $scope.receivedFrom = response.data;

                    });
            }

        }]);
}());