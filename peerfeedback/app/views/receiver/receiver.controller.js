/**
 * Created by adamellis on 16/02/2017.
 */
(function () {
    'use strict';

    angular
        .module('PeerFeedback')
        .controller('ReceiverController', ReceiverController);

    ReceiverController.$inject = ['receiver','$stateParams'];

    /* @ngInject */
    function ReceiverController(receiver,$stateParams) {
        const vm = this;

        activate();


        function activate() {
            vm.core = {
                aid:$stateParams.aid,
                receiverSid:$stateParams.receiverSid,
                providerSid:$stateParams.providerSid,
            };

            vm.auth ={
                token:$stateParams.token,
                email:$stateParams.email
            };

            vm.academic=$stateParams.academic;


            vm.receiver = receiver;
            if(vm.academic){
                vm.receiver.title.alias = $stateParams.name;
            }

            vm.readOnly = true;
        }
    }

})();

