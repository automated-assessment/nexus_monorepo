(function(){
    angular.module('PeerFeedback')
        .directive('formBuild',['$compile',function($compile){

            function link(scope,elem,attrs){
                scope.vm.formObject = elem.formBuilder({dataType:'json',formData:scope.vm.assignmentConfig.formBuild}).data('formBuilder');
                let saveElem = elem.find('.form-builder-save').html(`<div ng-click="vm.saveAssignmentConfig()">Save</div>`);
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


