/**
 * Created by adamellis on 14/03/2017.
 */
(function () {
    angular
        .module('PeerFeedback')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('frameState.providerState', {
                    url: '/provider?receiverSid?providerSid?hash',
                    params: {
                        receiverSid: null,
                        providerSid: null,
                        aid: null
                    },
                    templateUrl: 'app/views/provider/provider.html',
                    controller: 'ProviderController as vm',
                    resolve: {
                        submission: submission,
                        provider: provider,

                    }
                });

            submission.$inject = ['$stateParams', 'gitNetwork','$sce'];
            provider.$inject = ['$stateParams','allocationNetwork'];

            function submission($stateParams, gitNetwork,$sce) {
                return gitNetwork.getGitSubmission($stateParams.receiverSid)
                    .then(function (response) {
                        return trustHtml(response.data,$sce);
                    });
            }


            function provider($stateParams, allocationNetwork) {
                return allocationNetwork.getOneAllocation($stateParams,allocationNetwork.PROVIDER)
                    .then(function (response) {
                        return response.data;
                    });
            }

            function trustHtml(contentsArray,$sce){
                for(let i=0;i<contentsArray.length;i++){
                    contentsArray[i].content = $sce.trustAsHtml(contentsArray[i].content);
                }
                return contentsArray;
            }

        }]);
}());

