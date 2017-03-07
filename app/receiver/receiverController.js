/**
 * Created by adamellis on 16/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('receiverController',['receivedForm','$stateParams',function(receivedForm,$stateParams){

            const vm = this;
            console.log(receivedForm);
            vm.currentForm = receivedForm.currentForm;
            vm.provided = receivedForm.provided;
            vm.alias = $stateParams.alias;









        }]);
}());