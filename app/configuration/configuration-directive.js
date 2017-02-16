(function(){
    angular.module('PeerFeedback')
        .directive('wrapForm',function(){

            function link(scope, elem){

                const form = elem.formBuilder({
                    dataType:'json'
                }).data('formBuilder');
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


