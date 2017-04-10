/**
 * Created by adamellis on 07/04/2017.
 */
(function () {
    'use strict';

    angular
        .module('PeerFeedback')
        .directive('accordion', accordion);

   accordion.$inject = ['$stateParams','allocationNetwork'];

    /* @ngInject */
    function accordion($stateParams,allocationNetwork) {
        return {
            link: link,
            bindToController:true,
            controller:accordionController,
            controllerAs:'vm',
            restrict: 'E',
            scope: {
               core:'<',
                email:'<'
            },
            templateUrl:'/app/templates/accordion.tpl',
        };

        function link(scope,elem,attrs,vm){
            vm.submission = {};
            vm.submission.core = vm.core;
            vm.academic = true;

            vm.auth = {
                user:$stateParams.aid,
                token:$stateParams.token
            };



            $stateParams.sid = vm.submission.core.sid;

            allocationNetwork.getReceivers($stateParams,vm.auth)
                .then(function(response){
                    if(response.data){
                        vm.submission.provideTo = response.data.receivers;
                        vm.submission.provideTo.forEach(function(receiver){
                            receiver.title.alias = receiver.title.receiverName;
                            receiver.urlParams = {
                                aid:vm.submission.core.aid,
                                token:$stateParams.token,
                                academic:true
                            };
                            receiver.urlParams.receiverSid = receiver.receiverSid;
                            receiver.urlParams.providerSid = receiver.providerSid;
                        });
                    }

                });

            allocationNetwork.getProviders($stateParams,vm.auth)
                .then(function(response){
                    if(response.data){
                        vm.submission.receivedFrom = response.data.providers;
                        vm.submission.receivedFrom.forEach(function(provider){
                            provider.title.alias = provider.title.providerName;
                            provider.urlParams = {
                                aid:vm.submission.core.aid,
                                token:$stateParams.token,
                                academic:true
                            };
                            provider.urlParams.receiverSid  = provider.receiverSid;
                            provider.urlParams.providerSid = provider.providerSid;
                        })
                    }

                })

        }
    }

    /* @ngInject */

    accordionController.$inject = ['allocationNetwork'];

    function accordionController(allocationNetwork) {
        const vm = this;

    }

})();

