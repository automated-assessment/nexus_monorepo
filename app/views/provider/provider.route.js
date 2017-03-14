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
                        receiverSid:"11",
                        providerSid:"12",
                        aid:"1",
                    },
                    templateUrl:'app/views/provider/provider.html',
                    controller:'ProviderController as vm',
                    resolve:{

                        provider:['$stateParams','allocationService',function($stateParams,allocationService){
                            let form;
                            if($stateParams.receiverSid && $stateParams.providerSid){
                                allocationService.getRelation($stateParams.receiverSid,$stateParams.providerSid)
                                    .then(function(response){
                                        form = {
                                            currentForm: response.data.currentForm,
                                            provided:response.data.provided
                                        };
                                        console.log(response.data);

                                    });
                            } else {
                                form = {
                                    currentForm:""
                                };
                            }

                            return "Hello";

                        }]
                    }
                });

        }]);
}());