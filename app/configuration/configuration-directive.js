(function(){
    angular.module('PeerFeedback')
        .directive('wrapForm',function(){

            function link(scope, elem){

                var form = elem.formBuilder().data('formBuilder');
                $(".form-builder-save").click(function(e){
                    scope.newConfig.formBuild = form.formData;
                   scope.createConfig();
                });

            }


            return {
                restrict:'E',
                link:link
            }
        });
}());


