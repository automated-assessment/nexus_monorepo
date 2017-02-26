(function(){
    angular.module('PeerFeedback')
        .directive('formBuild',['$anchorScroll','configurationAPI',function($anchorScroll,configurationAPI){

            function link(scope, elem, attrs){
                const form = elem.formBuilder(scope.$eval(attrs.options)).data('formBuilder');
                //looking to try find a way of keeping model updated, rather than onSave
                elem.find('.form-builder-save').click(function(e){
                    scope.config.formBuild = form.formData;
                    configurationAPI.postForm(scope.config)
                        .then(
                            function(){
                                scope.notify("Your form has been saved successfully.","success");
                                $anchorScroll();
                            },
                            function(){
                                scope.notify("There was an error saving the form, please try again.","danger");
                                $anchorScroll();
                            }
                        )
                })

            }
            return {
                restrict:'E',
                link:link,
                scope:{
                    config:'=',
                    save:'&',
                    notify:'='

                }
            }
        }]);
}());