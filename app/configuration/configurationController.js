/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('configurationController',['$scope','$stateParams', 'assignmentConfig','NotificationService','$http',function($scope,$stateParams,assignmentConfig, NotificationService,$http){
            const vm = this;

            vm.providerCounts = assignmentConfig.providerCounts;
            vm.assignmentConfig = assignmentConfig.config;



            vm.updateAssignmentConfig = function(){
                if($stateParams.aid){
                    console.log(vm.assignmentConfig.formBuild);
                    $http.put(`/api/assignments/${$stateParams.aid}`,{data:vm.assignmentConfig})
                        .then(function(response){

                            NotificationService.createNotification("Your form was saved successfully","success");
                        })
                } else {
                    NotificationService.createNotification("There was an error creating your form, please try again.","danger");
                }

            };
        }]);
}());