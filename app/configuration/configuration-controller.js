/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('ConfigurationController',['$scope','$http','StudentCountFactory',function($scope,$http,StudentCountFactory){
            $scope.newConfig = {};
            $scope.numbers=StudentCountFactory;
            $scope.newConfig.providerCount = $scope.numbers[0];
            $scope.createConfig = function(){
                $http.post('/api/config/create',$scope.newConfig)
                    .then(function(response){
                        console.log("Successfully added to db.");
                        console.log(response.data);
                    })
            };





        }]);
}());