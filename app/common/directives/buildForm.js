(function(){
    angular.module('PeerFeedback')
        .directive('buildForm',['$compile',function($compile){

            function link(scope,elem){
                scope.vm.formObject = elem.formBuilder({dataType:'json',formData:scope.vm.assignmentConfig.formBuild}).data('formBuilder');
                let saveElem = elem.find('.form-builder-save').attr("ng-click","vm.updateAssignmentConfig()");
                $compile(saveElem)(scope);
            }
            return {
                restrict:'E',
                link:link,
                scope:{
                    vm:'='
                }
            }
        }]);
}());


