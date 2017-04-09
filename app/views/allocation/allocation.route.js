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

            receivers.$inject = ['allocationNetwork','$stateParams'];
            providers.$inject = ['allocationNetwork','$stateParams'];
            submission.$inject = ['submissionNetwork','$stateParams'];

            //

            //Allocation view
            function receivers(allocationNetwork,$stateParams){
                if($stateParams.sid){
                    const auth = {
                        user:$stateParams.sid,
                        token:$stateParams.token
                    };
                    return allocationNetwork.getReceivers($stateParams,auth)
                        .then(function(response){
                            return response.data;
                        })
                } else{
                    return {};
                }
            }

            function providers(allocationNetwork,$stateParams){
                if($stateParams.sid){
                    const auth = {
                        user:$stateParams.sid,
                        token:$stateParams.token
                    };
                    return allocationNetwork.getProviders($stateParams,auth)
                        .then(function(response){
                            return response.data;
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