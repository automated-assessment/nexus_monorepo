/**
 * Created by adamellis on 15/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .directive('renderForm',['providerAPI',function(providerAPI){
            function link(scope,elem,attrs){
                scope.getFormPromise(scope.submission.sid,scope.submission.studentuid)
                    .then(function(response){
                        const currentForm = response.data.providers[0].currentForm;
                        const renderOpts = {
                            formData:currentForm,
                            dataType:'json'
                        };
                        elem.formRender(renderOpts);
                        scope.submission.currentForm = currentForm;
                    })
            }
            return {
                restrict:'A',
                link:link
            }
        }])
}());