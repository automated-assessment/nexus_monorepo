(function(){
    angular.module('PeerFeedback')
        .directive('buildForm',['$interval',function($interval){

            function link(scope,elem){
                console.log(scope);
                const form = elem.formBuilder({dataType:'json',formData:scope.vm.assignment.formBuild,showActionButtons:false}).data('formBuilder');
                $interval(function(){
                    scope.vm.assignment.formBuild =form.formData;
                },500);
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


