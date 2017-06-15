/**
 * Created by adamellis on 06/02/2017.
 */

(function () {
    angular.module('PeerFeedback')
        .controller('ProviderController', ProviderController);

    ProviderController.$inject = ['$stateParams', 'provider', 'allocationNetwork', 'notification','submission'];

    function ProviderController($stateParams, provider, allocationNetwork, notification,submission) {

        const vm = this;
        activate();



        vm.mark.hoveringOver = function (value) {
            vm.mark.overStar = value;
            vm.mark.percent = 100 * (value / vm.mark.max);
        };

        vm.updateFeedback = function () {

            const update = {
                currentForm: vm.provider.currentForm,
                providerMark: (vm.mark.rate) * 10,
                provided: true,
                dateModified: new Date()
            };


            allocationNetwork.updateAllocation(vm.core.receiverSid, vm.core.providerSid,vm.auth.token, update)
                .then(function (response) {
                        const successMessage = "Your feedback has been successfully submitted. Thank you";
                        notification.create(successMessage, notification.SUCCESS);
                    },
                    function (err) {
                        const failMessage = "There was an error submitting your feedback, please try again later.";
                        notification.create(failMessage, notification.FAILURE);
                    })

        };

        vm.report = function(){

        };
        function activate() {
            vm.core = {
                receiverSid: $stateParams.receiverSid,
                providerSid: $stateParams.providerSid,
                aid:$stateParams.aid
            };
            vm.auth = {
                token:$stateParams.token,
                email:$stateParams.email
            };
            vm.academic = $stateParams.academic;

            vm.provider = provider;
            if(vm.academic){
                vm.provider.title.alias = $stateParams.name;
            }

            vm.submission = submission;

            vm.mark = {
                rate:0,
                max:10,
                isReadOnly:false
            };
        }


    }
}());


