/**
 * Created by adamellis on 16/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('ReceiverController',function($scope,$stateParams,$http){
           $scope.submission={};
           $scope.sid = $stateParams.sid;
           $scope.studentuid = $stateParams.studentuid;

           $http({
               method:'GET',
               url:'/api/receiver/getForm',
               params: {
                   sid:$stateParams.sid,
                   studentuid:$stateParams.studentuid
               }
           })
               .then(function(response){
                   $scope.currentForm = response.data.studentpid[0].form;
                   console.log(response.data);
               })
        });
}());