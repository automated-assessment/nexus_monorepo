/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider',function($stateProvider){
            $stateProvider
                .state('frameState.receiverState',{
                    url:'/receiver',
                    params:{
                        receiverSid:null,
                        providerSid:null,
                        aid:null
                    },
                    templateUrl:'app/views/receiver/receiver.html',
                    controller:'ReceiverController as vm',
                    resolve:{
                        receivedForm:['$stateParams','networkProvider',function($stateParams, networkProvider){
                            const form = {};
                            networkProvider.getSubmissionRelation($stateParams.receiversid,$stateParams.providersid)
                                .then(function(response){
                                    form.currentForm =response.data.currentForm;
                                    form.provided = response.data.provided;
                                });

                            return form;
                        }]
                    }
                });


        }]);
}());