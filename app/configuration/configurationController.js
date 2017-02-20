/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('configurationController',['$scope','$stateParams','providerCountFactory','configurationAPI',
            function($scope,$stateParams,StudentCountFactory,configurationAPI){
            $scope.newConfig = {};
            $scope.newConfig.aid = $stateParams.aid;
            $scope.numbers=StudentCountFactory;
            $scope.newConfig.providerCount = $scope.numbers[0];

            $scope.saveConfig = function(){
                configurationAPI.postForm($scope.newConfig);
            }


        }]);
}());