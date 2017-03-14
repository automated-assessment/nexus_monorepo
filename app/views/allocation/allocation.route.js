/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider',function($stateProvider){
            $stateProvider
                .state('frameState.allocationState',{
                    url:'/allocation?sid?aid',
                    templateUrl:'app/views/allocation/allocation.html',
                    controller:'AllocationController as vm',
                    resolve:{
                        receivers:receivers,
                        providers:providers,
                        submission:submission

                    }
                });

            receivers.$inject = ['allocationService','$stateParams'];
            providers.$inject = ['allocationService','$stateParams'];
            submission.$inject = ['submissionService','$stateParams'];

            //

            //Allocation view
            function receivers(allocationService,$stateParams){
                if($stateParams.sid){
                    return allocationService.getReceivers($stateParams.sid);
                }
            }

            function providers(allocationService,$stateParams){
                if($stateParams.sid){
                    return allocationService.getProviders($stateParams.sid);
                }
            }

            function submission(submissionService,$stateParams){
                if($stateParams.sid){
                    return submissionService.getOneSubmission($stateParams.sid);
                }
            }
        }]);
}());