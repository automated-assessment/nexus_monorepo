/**
 * Created by adamellis on 06/02/2017.
 */
(function () {
    angular.module('PeerFeedback')
        .controller('ConfigurationController', ConfigurationController);

    ConfigurationController.$inject = ['$scope','notificationService', 'assignment', 'assignmentNetwork', 'providerCounts', 'tooltip', 'academicUrlParams'];

    function ConfigurationController($scope,notificationService, assignment, assignmentNetwork, providerCounts, tooltip, academicUrlParams) {
        const vm = this;

        activate();

        vm.updateAssignment = updateAssignment;


        function updateAssignment() {

            vm.assignment.preExists = true;

            assignmentNetwork.updateAssignment(vm.assignment.aid, vm.assignment)
                .then(function (response) {

                        const successMessage = "Assignment configuration saved successfully. " ;
                        notificationService.create(successMessage, notificationService.SUCCESS);
                    },
                    function () {
                        const failMessage = "Assignment configuration failed to save, please try again.";
                        notificationService.create(failMessage, notificationService.FAILURE);
                    })
        }


        function activate() {
            vm.academicUrlParams = academicUrlParams;
            vm.assignment = assignment;
            vm.providerCounts = providerCounts;
            vm.tooltip = tooltip;
            //TODO retrieve previous assignmentConfigs by date

        }

    }
}());