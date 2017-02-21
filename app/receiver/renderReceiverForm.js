/**
 * Created by adamellis on 15/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .directive('renderReceiverForm',['receiverAPI',function(receiverAPI){
            function link(scope,elem,attrs){
                receiverAPI.getFormPromise(scope.submission.sid,scope.submission.studentuid)
                    .then(function(response){

                        const provided = response.data.providers[0].provided;
                        if(provided) {
                            const currentForm = response.data.providers[0].currentForm;
                            const renderOpts = {
                                formData: currentForm,
                                dataType: 'json'
                            };
                            elem.formRender(renderOpts);
                        } else {
                            elem.html("Please wait for feedback");
                        }
                    })

            }



            return {
                restrict:'A',
                link:link
            }
        }])
}());