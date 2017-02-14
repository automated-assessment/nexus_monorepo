/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('ProviderController',['$scope','$sce','GithubRetrievalFactory','$stateParams',function($scope,$sce,GithubRetrievalFactory,$stateParams){
                    GithubRetrievalFactory.then(function(response){
                        //check this is safe to inject.
                        $scope.sid = $stateParams.sid;
                        console.log($stateParams.studentuid);
                        $scope.myHTML = $sce.trustAsHtml(response.data);

                        //inject form to fill.

                        //get particular submission using aid and sid

                        });
        }]);
}());




