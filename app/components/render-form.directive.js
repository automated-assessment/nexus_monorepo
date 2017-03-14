/**
 * Created by adamellis on 15/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .directive('renderForm',function(){
            function link(scope,elem) {
                const currentForm = scope.vm.currentForm;
                const renderOpts = {
                    formData:currentForm,
                    dataType:'json'
                };
                elem.formRender(renderOpts);
            }

            return {
                restrict:'A',
                link:link,
                scope:{
                    vm:'='
                }
            }
        })
}());