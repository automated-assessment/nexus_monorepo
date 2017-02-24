/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('configurationController',['$scope','$stateParams','configurationAPI','$anchorScroll',
            function($scope,$stateParams,configurationAPI){
            $scope.providerCounts = [2,3,4,5,6,7,8];

            $scope.newConfig = {
                    aid:$stateParams.aid,
                    date:new Date(),
                    providerCount:$scope.providerCounts[0]
            };
        }]);
}());


