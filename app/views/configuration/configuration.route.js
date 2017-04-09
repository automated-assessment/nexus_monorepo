/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .config(['$stateProvider',function($stateProvider){
            $stateProvider
                .state('frameState.configurationState',{
                    url:'/configuration?aid?token?email',
                    templateUrl:'app/views/configuration/configuration.html',
                    controller:'ConfigurationController as vm',
                    resolve:{
                        assignment:assignment,
                        tooltip:tooltip

                    }
                });

            assignment.$inject = ['$stateParams','assignmentNetwork'];

            function assignment($stateParams,assignmentNetwork){
                if($stateParams.aid){
                    return assignmentNetwork.getOneAssignment($stateParams.aid)
                        .then(function(response){
                            if(response.data){
                                const assignment = response.data;
                                assignment.email = $stateParams.email;
                                return assignment;
                            } else {
                                return {
                                    aid:$stateParams.aid,
                                    providerCount:2,
                                    email:$stateParams.email,
                                    additionalConfiguration:{
                                        awaitBiDirection:false,
                                        contributeFinalMark:false
                                    }
                                };
                            }

                        });
                } else {
                    return {};
                }
            }

            function tooltip() {
                return {
                    providerCount: "Select the maximum number of allocations for a submission of this assignment.",
                    usePreviousForm: "Reuse a form you previously built.",
                    bidirectionalFeedback: "Withold student feedback until they've both submitted feedback for each other.",
                    sendMarkToNexus: "Send the average of the final mark directly to Nexus."
                }
            }
        }]);
}());