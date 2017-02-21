(function(){
    angular.module('PeerFeedback')
        .controller('allocationController',['$scope','$stateParams','allocationAPI','parseAssignments',function($scope,$stateParams,allocationAPI,parseAssignments){

            $scope.studentuid = $stateParams.studentuid;


            let allocationResponse = {};


            allocationAPI.getAllocation($stateParams.studentuid,'provideTo')
                .then(function(response){
                    //$scope.provideTo = response.data;
                    allocationResponse.provideTo = response.data;
                    allocationAPI.getAllocation($stateParams.studentuid,'receivedFrom')
                        .then(function(response){
                            //$scope.receivedFrom = response.data;
                            allocationResponse.receivedFrom=response.data;
                           $scope.allocation = parseAssignments.parse(allocationResponse);
                        });

                });


        }]);
}());

