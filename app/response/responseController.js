/**
 * Created by adamellis on 21/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('responseController',['$scope','responseFactory','responseService',function($scope,responseFactory,responseService){
            console.log(responseFactory.speak());

            console.log(responseService.speak());

        }]);
}());