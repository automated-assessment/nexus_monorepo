/**
 * Created by adamellis on 21/02/2017.
 */
(function () {
    angular.module('PeerFeedback')
        .controller('AllocationController', AllocationController);


    AllocationController.$inject = ['submission', 'receivers', 'providers','allocationDisplay'];
    function AllocationController(submission, receivers, providers,allocationDisplay) {



        const vm = this;

        vm.submission = {
            core: submission,
            provideTo: receivers.receivers,
            receivedFrom: providers.providers
        };

        allocationDisplay.getDisplay(vm.submission);
        //console.log(allocationDisplay.receivedOnly(vm.submission));

        //console.log(vm.submission);
    }
}());