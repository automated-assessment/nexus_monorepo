/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider',function($stateProvider){
            $stateProvider
                .state('frameState.allocationState',{
                    url:'/allocation?sid?token',
                    templateUrl:'app/views/allocation/allocation.html',
                    controller:'AllocationController as vm',
                    resolve:{
                        receivers:receivers,
                        providers:providers,
                        submission:submission

                    }
                });

            receivers.$inject = ['submissionNetwork','$stateParams'];
            providers.$inject = ['submissionNetwork','$stateParams'];
            submission.$inject = ['submissionNetwork','$stateParams'];

            //Allocation view
            function receivers(submissionNetwork,$stateParams){
                if($stateParams.sid){
                    const auth = {
                        user:$stateParams.sid,
                        token:$stateParams.token
                    };
                    return submissionNetwork.getReceivers($stateParams,auth)
                        .then(function(response){
                            return response.data.receivers;
                        })
                } else{
                    return {};
                }
            }

            function providers(submissionNetwork,$stateParams){
                if($stateParams.sid){
                    const auth = {
                        user:$stateParams.sid,
                        token:$stateParams.token
                    };
                    return submissionNetwork.getProviders($stateParams,auth)
                        .then(function(response){
                            return response.data.providers;
                        })
                } else{
                    return {};
                }
            }

            function submission(submissionNetwork,$stateParams){
                const auth = {
                    user:$stateParams.sid,
                    token:$stateParams.token
                };
                if($stateParams.sid){
                    return submissionNetwork.getOneSubmission($stateParams,auth)
                        .then(function(response){
                            return response.data;
                        })
                }
            }
        }]);
}());