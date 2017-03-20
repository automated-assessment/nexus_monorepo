/**
 * Created by adamellis on 15/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .directive('renderForm',['$interval','feedbackForm',function($interval,feedbackForm){

            return {
                restrict:'A',
                link:link,
                scope:{
                    currentForm:'=',
                    disable:'='
                }
            };

            function link(scope,elem, attrs) {
                const renderOpts = {
                    formData:scope.currentForm || "",
                    dataType:'json'
                };
                elem.formRender(renderOpts);
                watchAndDestroy(scope,elem);
            }

            function watchAndDestroy(scope,elem){
                const fakeWatcher = $interval(function(){
                    scope.currentForm = feedbackForm.save(elem[0],scope.currentForm);
                },500);

                elem.on('$destroy', function() {
                    $interval.cancel(fakeWatcher);
                });
            }
        }])
}());