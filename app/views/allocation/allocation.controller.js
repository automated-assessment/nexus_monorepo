/**
 * Created by adamellis on 21/02/2017.
 */
(function () {
    angular.module('PeerFeedback')
        .controller('AllocationController', AllocationController);


    AllocationController.$inject = ['$stateParams','submission', 'receivers', 'providers','allocationDisplay'];
    function AllocationController($stateParams,submission, receivers, providers,allocationDisplay) {



        const vm = this;


        // <!--<a ui-sref="frameState.providerState({receiverSid:{{receiver.receiverSid}},providerSid:{{vm.submission.core.sid}},aid:{{vm.submission.core.aid}},token:'{{vm.auth.token}}',email:'{{vm.auth.email}}',academic:'{{vm.academic}}'})">-->



        vm.auth = {
            token: $stateParams.token
        };

        vm.submission = {};
        vm.submission.core = submission;



        console.log(receivers);
        console.log(providers);


        receivers.forEach(function(receiver){
            receiver.urlParams ={
                aid:vm.submission.core.aid,
                token:$stateParams.token,
                receiverSid:receiver.receiverSid,
                providerSid:receiver.providerSid
            };
        });

        vm.submission.provideTo = receivers;

        providers.forEach(function(provider){
            provider.urlParams = {
                aid:vm.submission.core.aid,
                token:$stateParams.token,
                receiverSid:provider.receiverSid,
                providerSid:provider.providerSid
            };
            provider.urlParams.receiverSid = vm.submission.core.sid;
            provider.urlParams.providerSid = provider.providerSid;
        });

        vm.submission.receivedFrom = providers;


        allocationDisplay.getDisplay(vm.submission);

    }
}());