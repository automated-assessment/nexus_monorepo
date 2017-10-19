(function(){
    angular.module('PeerFeedback')
        .directive('buildForm',buildForm);

    buildForm.$inject = ['$interval'];

    function buildForm($interval) {

        return {
            restrict: 'E',
            link: link,
            scope: {
                vm: '='
            }
        };

        function link(scope, elem) {
            const form = elem.formBuilder({
                dataType: 'json',
                formData: scope.vm.assignment.formBuild,
                showActionButtons: false,
                controlPosition:'left',
                disableFields:['autocomplete','button','checkbox','file']
            }).data('formBuilder');
            watchAndDestroy(scope, elem, form);
        }

        function watchAndDestroy(scope, elem, form) {

            const fakeWatcher = $interval(function () {
                scope.vm.assignment.formBuild = form.formData;
            }, 500);
            elem.on('$destroy', function () {
                $interval.cancel(fakeWatcher);
            });
        }
    }
}());


