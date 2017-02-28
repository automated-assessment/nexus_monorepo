/**
 * Created by adamellis on 23/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('frameController',['$scope','$rootScope',function($scope,$rootScope){

            $rootScope.$on('$stateChangeStart',function(event){
               $scope.hideNotification();
            });

                //can be called on loaded throughout
                //$scope.createNotification("Oops!","warning");

        }]);
}());