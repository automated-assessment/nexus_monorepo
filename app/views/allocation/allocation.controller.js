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

        vm.submission.receivedFrom.forEach(function(provider){
            provider.display = allocationDisplay.getDisplay(vm.submission,provider.receiverSid, provider.providerSid);
        });
        //console.log(allocationDisplay.receivedOnly(vm.submission));

        //console.log(vm.submission);
    }
}());