/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider',function($stateProvider){
            $stateProvider
                .state('frameState.allocationState',{
                    url:'/allocation?sid',
                    templateUrl:'app/views/allocation/allocation.html',
                    controller:'AllocationController as vm',
                    resolve:{
                        receivers:receivers,
                        providers:providers,
                        submission:submission

                    }
                });

            receivers.$inject = ['allocationNetService','$stateParams'];
            providers.$inject = ['allocationNetService','$stateParams'];
            submission.$inject = ['submissionNetService','$stateParams'];

            //

            //Allocation view
            function receivers(allocationNetService,$stateParams){
                if($stateParams.sid){
                    return allocationNetService.getReceivers($stateParams.sid)
                        .then(function(response){
                            return response.data;
                        })
                }
            }

            function providers(allocationNetService,$stateParams){
                if($stateParams.sid){
                    return allocationNetService.getProviders($stateParams.sid)
                        .then(function(response){
                            return response.data;
                        })
                }
            }

            function submission(submissionNetService,$stateParams){
                if($stateParams.sid){
                    return submissionNetService.getOneSubmission($stateParams.sid)
                        .then(function(response){
                            return response.data;
                        })
                }
            }
        }]);
}());