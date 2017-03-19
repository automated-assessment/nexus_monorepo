/**
 * Created by adamellis on 06/02/2017.
 */
(function() {
    angular.module('PeerFeedback')
        .controller('ConfigurationController', ConfigurationController);

    ConfigurationController.$inject = ['notificationService', 'assignment', 'assignmentNetService', 'providerCounts'];

    function ConfigurationController(notificationService, assignment, assignmentNetService, providerCounts) {
        const vm = this;

        activate();
        console.log(assignment);
        vm.assignment = assignment;
        vm.assignment.dateCreated = vm.dates[0];

        vm.updateAssignment = updateAssignment;


        function updateAssignment() {
            console.log("Hello");
            assignmentNetService.updateAssignment(vm.assignment.aid, vm.assignment)
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