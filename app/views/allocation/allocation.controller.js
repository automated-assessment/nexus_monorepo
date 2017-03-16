/**
 * Created by adamellis on 21/02/2017.
 */
(function () {
    angular.module('PeerFeedback')
        .controller('AllocationController', AllocationController);


    AllocationController.$inject = ['submission', 'receivers', 'providers'];
    function AllocationController(submission, receivers, providers) {

        const vm = this;

        vm.true = true;
        vm.false = false;

        vm.submission = {
            core: submission,
            provideTo: receivers,
            receivedFrom: providers
        };
    }
}());