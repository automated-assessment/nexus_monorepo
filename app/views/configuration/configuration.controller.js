/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('ConfigurationController',['notificationService','assignment','assignmentService','providerCounts',function(notificationService,assignment,assignmentService,providerCounts){
            const vm = this;

            activate();

            vm.assignment = assignment;


            vm.updateAssignment = function(){
                assignmentService.updateAssignment(vm.assignment.aid,vm.assignment)
                    .then(function(response){
                        notificationService.createNotification("Assignment configuration saved successfully.","success");
                    },
                    function(){
                        notificationService.createNotification("Assignment configuration failed to save, please try again.","danger");
                    })
            };

            function activate(){
                vm.providerCounts = providerCounts;
            }
        }]);
}());