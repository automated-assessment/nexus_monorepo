/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('ProviderController',['$scope','$sce','RetrievalFactory',function($scope,$sce,RetrievalFactory){
                    RetrievalFactory.then(function(response){
                           $scope.myHTML = $sce.trustAsHtml(response.data);
                        });
        }]);
}());




