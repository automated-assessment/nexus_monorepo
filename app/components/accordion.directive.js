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
               submissionCore:'<',
                email:'<'
            },
            templateUrl:'/app/templates/accordion.tpl',
        };

        function link(scope,elem,attrs){
            const vm = scope.vm;
            vm.submission = {};
            vm.submission.core = scope.vm.submissionCore;
            console.log(vm.submission.core);
            const auth = {
                user:$stateParams.aid,
                token:$stateParams.token
            };
            $stateParams.sid = vm.submission.core.sid;
            allocationNetwork.getReceivers($stateParams,auth)
                .then(function(response){
                    vm.submission.provideTo = response.data.receivers;
                });

            allocationNetwork.getProviders($stateParams,auth)
                .then(function(response){
                    vm.submission.receivedFrom = response.data.providers;
                })

        }
    }

    /* @ngInject */

    accordionController.$inject = ['allocationNetwork'];

    function accordionController(allocationNetwork) {
        const vm = this;

    }

})();

