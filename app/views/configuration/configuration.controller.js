/**
 * Created by adamellis on 06/02/2017.
 */
(function () {
    angular.module('PeerFeedback')
        .controller('ConfigurationController', ConfigurationController);

    ConfigurationController.$inject = ['notification', 'assignment', 'assignmentNetwork', 'providerCounts', 'tooltip', 'academicUrlParams'];

    function ConfigurationController(notification, assignment, assignmentNetwork, providerCounts, tooltip, academicUrlParams) {
        const vm = this;

        activate();

        vm.updateAssignment = updateAssignment;


        function updateAssignment() {
            vm.assignment.preExists = true;

            const auth = {
                user:academicUrlParams.aid,
                token:academicUrlParams.token
            };
            assignmentNetwork.updateAssignment(academicUrlParams,auth, vm.assignment)
                .then(function (response) {
                        const successMessage = "Assignment configuration saved successfully. " ;
                        notification.create(successMessage, notification.SUCCESS);
                    },
                    function () {
                        const failMessage = "Assignment configuration failed to save, please try again.";
                        notification.create(failMessage, notification.FAILURE);
                    })
        }


        function activate() {
            vm.academicUrlParams = academicUrlParams;
            vm.assignment = assignment;
            vm.providerCounts = providerCounts;
            vm.tooltip = tooltip;
        }

    }
}());