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
                //need to add in some kind of check, this will run even with no branch - it shouldnt.
                    GithubRetrievalFactory.getPartial(response.data.branch)
                        .then(function (response) {
                            $scope.submission.gitHubSnippet = $sce.trustAsHtml(response.data);
                        });

            });


            $scope.getFormPromise = function(){
                return $http({
                    method:'GET',
                    url:'/api/provider/getForm',
                    params:{
                        sid:$stateParams.sid,
                        studentuid:$stateParams.studentuid
                    }
                });
            };

            $scope.saveForm = function(){
                $http.post('/api/provider/saveForm',$scope.submission)
                    .then(function(response){
                        console.log("Complete");
                    })
            };
        }])
}());




