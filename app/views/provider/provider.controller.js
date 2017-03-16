/**
 * Created by adamellis on 06/02/2017.
 */


//This needs a lot of work
(function() {
    angular.module('PeerFeedback')
        .controller('ProviderController', ProviderController);

    ProviderController.$inject = ['$sce', '$stateParams', 'provider','allocationService','notificationService'];

    function ProviderController($sce, $stateParams, provider, allocationService, notificationService,$scope) {

        const vm = this;

        activate();

        vm.mark.hoveringOver = function(value) {
            vm.mark.overStar = value;
            vm.mark.percent = 100 * (value / vm.mark.max);
        };

        vm.updateFeedback= function(){

            const update = {
                currentForm: vm.provider.currentForm,
                providerMark:(vm.mark.rate)*10,
                provided:true,
                dateModified:new Date()
            };
            allocationService.updateAllocation(vm.core.receiverSid,vm.core.providerSid,update)
                .then(function(response){
                        const successMessage = "Your feedback has been successfully submitted. Thank you";
                        notificationService.create(successMessage,notificationService.SUCCESS);
                    },
                    function(err){
                        const failMessage = "There was an error submitting your feedback, please try again later.";
                        notificationService.create(failMessage,notificationService.FAILURE);
                    })

        };

        function activate(){
            vm.core = {
                aid:$stateParams.aid,
                receiverSid:$stateParams.receiverSid,
                providerSid:$stateParams.providerSid
            };
            vm.provider = provider;

            vm.mark = {};
            vm.mark.rate = 0;
            vm.mark.max = 10;
            vm.mark.isReadonly = false;
        }

        //TODO: Add a modal in to ensure that provider wishes to navigate away, if changes have been made to the form.
        //TODO: Display git submission - priority


    }
}());



// networkProvider.getSubmissionProviders(vm.receiversid)
//     .then(function(response){
//         if(response.data.branch){
//             vm.snippet.branch = response.data.branch;
//             networkProvider.getGitContent(vm.aid,vm.snippet.branch)
//                 .then(function(response){
//                     vm.snippet.filePath = response.data[0]['path'];
//                     vm.snippet.fileType = response.data[0]['type'];
//                     if(vm.snippet.fileType == "dir"){
//                         networkProvider.getGitTree()
//                             .then(function(response){
//                                 return "";
//                             })
//                     } else if(vm.snippet.fileType="file"){
//                         networkProvider.getGitFile(vm.aid,vm.snippet.branch,vm.snippet.filePath)
//                             .then(function(response){
//                                 vm.snippet.submission = $sce.trustAsHtml(response.data);
//                             })
//                     }
//                 })
//                 .catch(function(){
//                     NotificationService.createNotification("There was an error retrieving the git hub submission, please try again later.","danger");
//                 })
//         } else {
//             return response;
//         }
//
//
//
//     });
//
//
//
//
// function handleZip(){
//
// }



