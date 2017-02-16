/**
 * Created by adamellis on 15/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .directive('renderForm',function(){






            function link(scope,elem,attrs){
                scope.getForm()
                    .then(function(response) {
                        if(response.data.formBuild){
                            elem.formRender({formData: response.data.formBuild, dataType: 'json'});
                            scope.submission.currentForm = response.data.formBuild;
                        }

                    })
            }
            return {
                restrict:'A',
                link:link
            }
        })
}());

/**




});
   **/