/**
 * Created by adamellis on 06/02/2017.
 */
(function() {
    angular.module('PeerFeedback')
        .controller('ProviderController', ['$scope', '$sce', 'GithubRetrievalFactory', '$stateParams','$http',function ($scope, $sce, GithubRetrievalFactory, $stateParams,$http) {
            //check this is safe to inject.
            $scope.sid = $stateParams.sid;
            $scope.aid = $stateParams.aid;
            $http({
                method:'GET',
                url: '/api/provider/getSubmission',
                params :{
                    aid:$stateParams.aid,
                    sid:$stateParams.sid
                }

            }).then(function(response) {
                $scope.submission = response.data;
                GithubRetrievalFactory.getPartial("submissions-u137-l")
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
                console.log("Yes");
                $http.post('/api/provider/saveForm',$scope.submittedForm);
            };





            //inject form to fill.

            //get particular submission using aid and sid
        }])
}());




