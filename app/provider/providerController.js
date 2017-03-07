/**
 * Created by adamellis on 06/02/2017.
 */


//This needs a lot of work
(function() {
    angular.module('PeerFeedback')
        .controller('providerController', ['$sce', '$stateParams', 'networkProvider','providerForm','NotificationService',function ($sce, $stateParams,networkProvider,providerForm,NotificationService) {

            const vm = this;


            console.log($stateParams);
            vm.alias = $stateParams.alias;
            vm.currentForm = providerForm.currentForm;
            vm.provided = providerForm.provided;


            vm.aid = $stateParams.aid;
            vm.receiversid = $stateParams.receiversid;
            vm.providersid = $stateParams.providersid;


            vm.snippet ={};

            networkProvider.getSubmissionProviders(vm.receiversid)
                .then(function(response){
                    if(response.data.branch){
                        vm.snippet.branch = response.data.branch;
                        networkProvider.getGitContent(vm.aid,vm.snippet.branch)
                            .then(function(response){
                                vm.snippet.filePath = response.data[0]['path'];
                                vm.snippet.fileType = response.data[0]['type'];
                                if(vm.snippet.fileType == "dir"){
                                    networkProvider.getGitTree()
                                        .then(function(response){
                                            return "";
                                        })
                                } else if(vm.snippet.fileType="file"){
                                    networkProvider.getGitFile(vm.aid,vm.snippet.branch,vm.snippet.filePath)
                                        .then(function(response){
                                            vm.snippet.submission = $sce.trustAsHtml(response.data);
                                        })
                                }
                            })
                            .catch(function(){
                                NotificationService.createNotification("There was an error retrieving the git hub submission, please try again later.","danger");
                            })
                    } else {
                        return response;
                    }



                });




            function handleZip(){

            }








        }])
}());







