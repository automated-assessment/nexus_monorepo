(function(){
    angular.module('PeerFeedback')
        .controller('AllocationController',['$scope','$stateParams','$http',function($scope,$stateParams,$http){


            $scope.aid = $stateParams.aid;
            $scope.studentuid = $stateParams.studentuid;
            //extract this to a factory
            $http({
                method:'GET',
                url:'/api/allocation/getProvideTo',
                params:{
                    aid:$stateParams.aid,
                    studentuid:$stateParams.studentuid
                }
            }).then(function(response){
                $scope.provideTo = response.data;

            });

            $http({
                method:'GET',
                url:'/api/allocation/getReceivedFrom',
                params:{
                    aid:$stateParams.aid,
                    studentuid:$stateParams.studentuid
                }
            }).then(function(response){

                $scope.receivedFrom = response.data;
            })



        }]);
}());