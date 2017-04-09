/**
 * Created by adamellis on 21/02/2017.
 */
(function () {
    angular.module('PeerFeedback')
        .controller('AllocationController', AllocationController);


    AllocationController.$inject = ['$stateParams','submission', 'receivers', 'providers','allocationDisplay'];
    function AllocationController($stateParams,submission, receivers, providers,allocationDisplay) {



        const vm = this;


        vm.auth = {
            token: $stateParams.token
        };
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