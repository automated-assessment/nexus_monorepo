/**
 * Created by adamellis on 04/04/2017.
 */
(function () {
    'use strict';

    angular
        .module('PeerFeedback')
        .factory('allocationDisplay', allocationDisplay);



    /* @ngInject */
    function allocationDisplay() {
        return {
            getDisplay:getDisplay,
            hasProvided:hasProvided,
            hasReceived:hasReceived
        };
    }

    function getDisplay(vm, receiverSid, providerSid){
        //get the assignment configuration and check it out, lets assume we want bidirectional
        //console.log(vm);
        return hasProvided(vm,receiverSid, providerSid) && hasReceived(vm, receiverSid, providerSid);
    }

    function hasProvided(vm, receiverSid, providerSid){
        for(let i=0;i<vm.provideTo.length;i++){
            if(vm.provideTo[i].providerSid == receiverSid && vm.provideTo[i].receiverSid == providerSid){
                return vm.provideTo[i].provided;
            }
        }
    }

    function hasReceived(vm, receiverSid, providerSid){
        for(let i=0;i<vm.receivedFrom.length;i++){
            if(vm.receivedFrom[i].providerSid == providerSid && vm.receivedFrom[i].receiverSid == receiverSid){
                return vm.receivedFrom[i].provided;
            }
        }
    }

})();

