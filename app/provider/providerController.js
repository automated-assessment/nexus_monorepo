/**
 * Created by adamellis on 06/02/2017.
 */
(function() {
    angular.module('PeerFeedback')
        .controller('ProviderController', ['$scope', '$sce', '$stateParams','providerAPI',function ($scope, $sce, $stateParams,providerAPI) {

            $scope.submission = {};
            $scope.submission.sid = $stateParams.sid;
            $scope.submission.aid = $stateParams.aid;
            $scope.submission.studentuid = $stateParams.studentuid;

            //need to add in some kind of check, this will run even with no branch - it shouldnt.
            //this could still be further extracted. shouldn't be in controller




            providerAPI.getSubmission($stateParams.sid).then(function(response) {
                    providerAPI.getPartial(response.data.branch)
                        .then(function (response) {
                            $scope.submission.gitHubSnippet = $sce.trustAsHtml(response.data);
                        });

            });

            $scope.saveForm = function(){
                providerAPI.saveForm($scope.submission);
            };

            $scope.getFormPromise = function(){
                return providerAPI.getFormPromise($stateParams.sid,$stateParams.studentuid);
            }
        }])
}());