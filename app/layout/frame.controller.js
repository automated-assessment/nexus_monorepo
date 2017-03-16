/**
 * Created by adamellis on 23/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('frameController',['$rootScope','notificationService',function($rootScope,notificationService){

            $rootScope.$on('$stateChangeStart',function(event){
               notificationService.hide();
            });

        }]);
}());