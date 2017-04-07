/**
 * Created by adamellis on 07/04/2017.
 */
(function () {
    'use strict';

    angular
        .module('PeerFeedback')
        .directive('accordion', accordion);

   // accordion.$inject = [''];

    /* @ngInject */
    function accordion() {
        return {
            bindToController: true,
            controller: accordionController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            scope: {
                header:'@'
            },
            template:'<div uib-accordion-group class="panel-default" heading="{{vm.header}}" is-open="false"><ng-transclude></ng-transclude></div>',
            transclude:true
        };


        function link(scope, element, attrs) {
            console.log(scope);
        }
    }




    /* @ngInject */
    function accordionController() {
        const vm = this;


    }

})();

