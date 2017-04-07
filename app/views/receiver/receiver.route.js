/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider',function($stateProvider){
            $stateProvider
                .state('frameState.receiverState',{
                    url:'/receiver?receiverSid,providerSid?token',
                    params:{
                        receiverSid:null,
                        providerSid:null,
                        aid:null
                    },
                    templateUrl:'app/views/receiver/receiver.html',
                    controller:'ReceiverController as vm',
                    resolve:{
                        receiver:['$stateParams','allocationNetwork',function($stateParams, allocationNetwork){
                            return allocationNetwork.getOneAllocation($stateParams,allocationNetwork.RECEIVER)
                                .then(function(response){
                                    return response.data;
                                });


                        }]
                    }
                });


        }]);
}());