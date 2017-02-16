/**
 * Created by adamellis on 06/02/2017.
 */
(function() {
    angular.module('PeerFeedback')
        .controller('ProviderController', ['$scope', '$sce', 'GithubRetrievalFactory', '$stateParams','$http',function ($scope, $sce, GithubRetrievalFactory, $stateParams,$http) {

            $scope.submission = {};
            $scope.submission.sid = $stateParams.sid;
            $scope.submission.aid = $stateParams.aid;
            $scope.submission.studentuid = $stateParams.studentuid;


            $http({
                method:'GET',
                url: '/api/provider/getSubmission',
                params :{
                    sid:$stateParams.sid
                }

            }).then(function(response) {

                GithubRetrievalFactory.getPartial(response.data[0].branch)
                    .then(function (response) {
                        $scope.myHTML = $sce.trustAsHtml(response.data);
                    });
            });


            $scope.getForm = function(){
                return $http({
                    method:'GET',
                    url:'/api/provider/getForm',
                    params:{
                        aid:$stateParams.aid
                    }
                });
            };

            $scope.saveForm = function(){
                $http.post('/api/provider/saveForm',$scope.submission)
                    .then(function(response){
                        console.log("Complete");
                    })
            };





            //inject form to fill.

            //get particular submission using aid and sid
        }])
}());




