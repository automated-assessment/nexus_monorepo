/**
 * Created by adamellis on 06/02/2017.
 */
(function() {
    angular.module('PeerFeedback')
        .controller('providerController', ['$scope', '$sce', '$stateParams', 'providerAPI', function ($scope, $sce, $stateParams, providerAPI) {
            //Within the provider page.
            //Need to retrieve the github submission dependent on the retrievalQuery
            //Need to retrieve the form
            //Need a listener for save of the form

            const submission = {
                aid: $stateParams.aid,
                providersid: $stateParams.providersid,
                sid: $stateParams.sid

            };

            $scope.submission = submission;

            // providerAPI.querySubmission(submission.providersid,submission.sid)
            //     .then(function(response){
            //         console.log(response);
            //         providerAPI.queryGitPartial(response.data.branch)
            //             .then(function(response){
            //                 $scope.submission.gitHubSnippet = $sce.trustAsHtml(response.data);
            //             })
            //     });

            $scope.test = function(){
                return "Something";
            };

        }])
}());







