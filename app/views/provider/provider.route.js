/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider',function($stateProvider){
            $stateProvider
                .state('frameState.providerState',{
                    url:'/provider?receiverSid?providerSid',
                    params:{
                        receiverSid:null,
                        providerSid:null,
                        aid:null
                    },
                    templateUrl:'app/views/provider/provider.html',
                    controller:'ProviderController as vm',
                    resolve:{

                        provider:['$stateParams','allocationService',function($stateParams,allocationService){
                            return allocationService.getRelation($stateParams.receiverSid,$stateParams.providerSid)
                                .then(function(response){
                                    return response.data;
                                })
                        }]
                    }
                });

        }]);
}());