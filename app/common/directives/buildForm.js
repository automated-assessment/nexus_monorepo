(function(){
    angular.module('PeerFeedback')
        .directive('buildForm',['$compile','$timeout',function($compile,$timeout){

            function link(scope,elem){

                const form = elem.formBuilder({dataType:'json',formData:scope.vm.assignmentConfig.formBuild}).data('formBuilder');

                const watcher = scope.$watch(function(){
                    return form.formData;
                },function(){
                    console.log("Change");
                },true);
                $timeout(watcher,0);







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


