(function(){
    angular.module('PeerFeedback')
        .controller('allocationController',['$scope','$stateParams','allocationAPI',function($scope,$stateParams,allocationAPI){
            $scope.aid = $stateParams.aid;
            $scope.studentuid = $stateParams.studentuid;

            allocationAPI.getAllocation($stateParams,'provideTo')
                .then(function(response){
                    $scope.provideTo = response.data;
                });
            allocationAPI.getAllocation($stateParams,'receivedFrom')
                .then(function(response){
                    $scope.receivedFrom = response.data;
                })

        }]);
}());