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
                        aid:null,
                        email:null,
                        academic:false,
                        name:null
                    },
                    templateUrl:'app/views/receiver/receiver.html',
                    controller:'ReceiverController as vm',
                    resolve:{
                        receiver:['$stateParams','allocationNetwork',function($stateParams, allocationNetwork){
                            console.log($stateParams);
                            let auth;
                            if($stateParams.email){
                                auth = {
                                    user:$stateParams.aid,
                                    token:$stateParams.token
                                }
                            } else {
                                auth = {
                                    user:$stateParams.receiverSid,
                                    token:$stateParams.token
                                }
                            }
                            return allocationNetwork.getOneAllocation($stateParams,auth)
                                .then(function(response){
                                    return response.data;
                                });


                        }]
                    }
                });


        }]);
}());