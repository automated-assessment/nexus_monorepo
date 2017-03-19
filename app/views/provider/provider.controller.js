/**
 * Created by adamellis on 06/02/2017.
 */


//This needs a lot of work
(function () {
    angular.module('PeerFeedback')
        .controller('ProviderController', ProviderController);

    ProviderController.$inject = ['$sce', '$stateParams', 'provider', 'allocationNetService', 'notificationService','snippets','gitNetService'];

    function ProviderController($sce, $stateParams, provider, allocationNetService, notificationService,snippets,gitNetService) {




        const vm = this;
        activate();


        gitNetService.getZip();



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
            allocationNetService.updateAllocation(vm.core.receiverSid, vm.core.providerSid, update)
                .then(function (response) {
                        const successMessage = "Your feedback has been successfully submitted. Thank you";
                        notificationService.create(successMessage, notificationService.SUCCESS);
                    },
                    function (err) {
                        const failMessage = "There was an error submitting your feedback, please try again later.";
                        notificationService.create(failMessage, notificationService.FAILURE);
                    })

        };

        function activate() {
            vm.core = {
                aid: $stateParams.aid,
                receiverSid: $stateParams.receiverSid,
                providerSid: $stateParams.providerSid,
                snippet: {}
            };
            vm.provider = provider;

            vm.snippets = snippets;

            vm.mark = {
                rate:0,
                max:10,
                isReadOnly:false
            };
        }

        //TODO: Add a modal in to ensure that provider wishes to navigate away, if changes have been made to the form.
        //TODO: Display git submission - priority


    }
}());


