/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('configurationController',['$scope','$stateParams','networkProvider','loadAssignment','NotificationService',function($scope,$stateParams,networkProvider,loadAssignment,NotificationService){
            const vm = this;

            vm.providerCounts = [2,3,4,5,6,7,8];
            vm.assignmentConfig = {
                    aid:$stateParams.aid,
                    date:new Date(),
                    providerCount:vm.providerCounts[0],
                    formBuild:loadAssignment.formBuild
            };



            vm.saveAssignmentConfig = function(){
                vm.assignmentConfig.formBuild = vm.formObject.formData;
                networkProvider.postAssignmentConfig(vm.assignmentConfig)
                    .then(function(response){
                        NotificationService.createNotification("The assignment configuration has been saved.","success");
                    })
                    .catch(function(response){
                        NotificationService.createNotification("There was an error saving your configuration, please try again.","danger");
                    })
            };
        }]);
}());