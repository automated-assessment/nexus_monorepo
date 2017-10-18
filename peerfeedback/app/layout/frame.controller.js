/**
 * Created by adamellis on 23/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('frameController',['$rootScope','notification',function($rootScope,notification){

            $rootScope.$on('$stateChangeStart',function(event){
               notification.hide();
            });

        }]);
}());