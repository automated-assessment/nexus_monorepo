/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider',function($stateProvider){
            $stateProvider
                .state('frameState.receiverState',{
                    url:'/receiver?receiverSid,providerSid',
                    params:{
                        receiverSid:null,
                        providerSid:null,
                        aid:null
                    },
                    templateUrl:'app/views/receiver/receiver.html',
                    controller:'ReceiverController as vm',
                    resolve:{
                        receiver:['$stateParams','allocationService',function($stateParams, allocationService){
                            return allocationService.getRelation($stateParams.receiverSid,$stateParams.providerSid)
                                .then(function(response){
                                    return response.data;
                                });


                        }]
                    }
                });


        }]);
}());