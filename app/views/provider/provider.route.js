/**
 * Created by adamellis on 14/03/2017.
 */
(function () {
    angular
        .module('PeerFeedback')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('frameState.providerState', {
                    url: '/provider?receiverSid?providerSid?token',
                    params: {
                        receiverSid: null,
                        providerSid: null,
                        aid: null,
                        email: null,
                        academic: false,
                        name:null
                    },
                    templateUrl: 'app/views/provider/provider.html',
                    controller: 'ProviderController as vm',
                    resolve: {
                        submission: submission,
                        provider: provider,

                    }
                });

            submission.$inject = ['$stateParams', 'gitNetwork', '$sce'];
            provider.$inject = ['$stateParams', 'allocationNetwork'];

            function submission($stateParams, gitNetwork, $sce) {
                let auth;
                if($stateParams.academic){
                    auth = {
                        user:$stateParams.aid,
                        token:$stateParams.token
                    }
                } else {
                    auth = {
                        user:$stateParams.providerSid,
                        token:$stateParams.token
                    }
                }
                return gitNetwork.getGitSubmission($stateParams,auth)
                    .then(function (response) {
                        return trustHtml(response.data,$sce);
                    });
            }


            function provider($stateParams, allocationNetwork) {
                let auth;
                if ($stateParams.academic) {
                    auth = {
                        user: $stateParams.aid,
                        token: $stateParams.token
                    }
                } else {
                    auth = {
                        user: $stateParams.providerSid,
                        token: $stateParams.token
                    }
                }

                return allocationNetwork.getOneAllocation($stateParams, auth)
                    .then(function (response) {
                        return response.data;
                    });
            }

            function trustHtml(contentsArray, $sce) {
                for (let i = 0; i < contentsArray.length; i++) {
                    contentsArray[i].content = $sce.trustAsHtml(contentsArray[i].content);
                }
                return contentsArray;
            }

        }]);
}());

