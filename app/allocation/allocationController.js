/**
 * Created by adamellis on 21/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('allocationController',['$scope','allocationAPI','$stateParams',function($scope,allocationAPI,$stateParams){


            //The two queries are very similar, extract them.

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

// <div ng-repeat="provider in receivedFrom.providers">
//     <a ui-sref="frameState.receiverState({{receivedFromQuery}})">
//     {{provider.alias}} from sid:{{provider.providersid}} to {{receivedFrom.sid}}
// </a>
//</div>