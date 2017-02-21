/**
 * Created by adamellis on 06/02/2017.
 */
(function() {
    angular.module('PeerFeedback')
        .controller('providerController', ['$scope', '$sce', '$stateParams','providerAPI',function ($scope, $sce, $stateParams,providerAPI) {
            $scope.submission = {};
            $scope.submission.sid = $stateParams.sid;
            $scope.submission.aid = $stateParams.aid;
            $scope.submission.studentuid = $stateParams.studentuid;

            //need to add in some kind of check, this will run even with no branch - it shouldnt.
            //this could still be further extracted. shouldn't be in controller


            providerAPI.getPartial($stateParams.sid)
                .then(function(response){
                    $scope.submission.gitHubSnippet = $sce.trustAsHtml(response.data);
                });



            $scope.saveForm = function(){
                providerAPI.saveForm($scope.submission);
            };

        }])
}());