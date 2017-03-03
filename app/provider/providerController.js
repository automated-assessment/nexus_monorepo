/**
 * Created by adamellis on 06/02/2017.
 */


//This needs a lot of work
(function() {
    angular.module('PeerFeedback')
        .controller('providerController', ['$sce', '$stateParams', 'networkProvider', function ($sce, $stateParams, networkProvider) {
            const vm = this;


            networkProvider.getSubmission($stateParams.providersid,$stateParams.sid)
                .then(function(response){
                    console.log(response);
                    networkProvider.getGitPartial(response.data.branch,$stateParams.aid)
                        .then(function(response){
                            console.log(response.data);
                        })
                })
        }])
}());







