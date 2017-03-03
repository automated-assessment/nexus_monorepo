/**
 * Created by adamellis on 21/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('allocationController',['$scope','networkProvider','$stateParams',function($scope,networkProvider,$stateParams){

            if($stateParams.sid){
                networkProvider.getProvideTo($stateParams.sid)
                    .then(function(response){
                        $scope.provideTo = response.data;

                    });
                networkProvider.getReceivedFrom($stateParams.sid)
                    .then(function(response){
                        $scope.receivedFrom = response.data;

                    });
            }

        }]);
}());