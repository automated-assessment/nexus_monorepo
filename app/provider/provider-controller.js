/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('ProviderController',['$scope','$sce','GithubRetrievalFactory','$http',function($scope,$sce,GithubRetrievalFactory,$http){
                    GithubRetrievalFactory.then(function(response){


                        //check this is safe to inject.
                        $scope.myHTML = $sce.trustAsHtml(response.data);

                        //inject form to fill.

                        //get particular submission using aid and sid

                        });
        }]);
}());




