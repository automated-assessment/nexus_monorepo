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


                        submission:['$stateParams','submissionNetService',function($stateParams,submissionNetService){
                            return submissionNetService.getGitData($stateParams.receiverSid)
                                .then(function(response){
                                    return response.data;
                                })
                        }],

                        snippets:['$stateParams','snippetsService','submission',function($stateParams,snippetsService,submission){
                            return snippetsService.getSnippets($stateParams.aid, submission.branch, submission.sha);
                        }],

                        provider:['$stateParams','allocationNetService',function($stateParams,allocationNetService){
                            return allocationNetService.getOneAllocation($stateParams.receiverSid,$stateParams.providerSid)
                                .then(function(response){
                                    return response.data;
                                });
                        }],






                    }
                });

        }]);
}());

//should get submission (i.e. git data) and then pass this into provider, so that provider is not actually accessing the submission. cleaner code.