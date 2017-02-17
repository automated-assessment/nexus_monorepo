(function(){
    angular.module('PeerFeedback')
        .directive('formBuild',function(){
            function link(scope, elem){
                const form = elem.formBuilder({
                    dataType:'json'
                }).data('formBuilder');
                $(".form-builder-save").click(function(e){
                    scope.newConfig.formBuild = form.formData;
                   scope.saveConfig();
                });
            }
            return {
                restrict:'E',
                link:link
            }
        });
}());


