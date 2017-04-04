/**
 * Created by adamellis on 06/02/2017.
 */
(function() {
    angular.module('PeerFeedback')
        .controller('ConfigurationController', ConfigurationController);

    ConfigurationController.$inject = ['notificationService', 'assignment', 'assignmentNetwork', 'providerCounts'];

    function ConfigurationController(notificationService, assignment, assignmentNetwork, providerCounts) {
        const vm = this;

        activate();
        vm.assignment = assignment;
        vm.assignment.dateCreated = vm.dates[0];

        vm.updateAssignment = updateAssignment;


        function updateAssignment() {
            assignmentNetwork.updateAssignment(vm.assignment.aid, vm.assignment)
                .then(function (response) {
                        const successMessage = "Assignment configuration saved successfully.";
                        notificationService.create(successMessage, notificationService.SUCCESS);
                    },
                    function () {
                        const failMessage = "Assignment configuration failed to save, please try again.";
                        notificationService.create(failMessage, notificationService.FAILURE);
                    })
        }
        //TODO implement contribution
        //TODO implement bidirectional


        function activate() {
            vm.providerCounts = providerCounts;
            //TODO retrieve previous assignmentConfigs by date
            vm.dates = [new Date().toDateString(), new Date().toDateString()];
        }

    }
}());