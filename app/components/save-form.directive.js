/**
 * Created by adamellis on 16/02/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .directive('saveForm',['notificationService','allocationService','$window',function(notificationService,allocationService,$window){
            //need to understand this code.
            //borrowed from internet
            const saveUserValues = function(container,json){
                const originalFormData = JSON.parse(json);
                const formData = new FormData(container);

                function getObj(objs, key, val) {
                    val = val.replace('[]', '');
                    return objs.filter(function(obj) {
                        let filter = false;
                        if (val) {
                            filter = (obj[key] === val);
                        } else if (obj[key]) {
                            filter = true;
                        }
                        return filter;
                    })[0];
                }
                function setValue(name, value) {
                    const field = getObj(originalFormData, 'name', name);
                    if (!field) {
                        return;
                    }
                    if (name.indexOf('[]') !== -1) {
                        for (const fieldOption of field.values) {
                            if (value.indexOf(fieldOption.value) !== -1) {
                                fieldOption.selected = true;
                            } else {
                                delete fieldOption.selected;
                            }
                        }
                    } else {
                        field.value = value[0];
                    }
                }
                for (const key of formData.keys()) {
                    setValue(key, formData.getAll(key));
                }
                return JSON.stringify(originalFormData);
            };


            function link(scope,elem,attrs){

                elem.click(function(){
                    const container = $('#render-form')[0];
                    const updatedForm = saveUserValues(container,scope.vm.currentForm);
                    scope.vm.provided = true;

                    console.log(updatedForm);
                    const response = {
                        currentForm:updatedForm,
                        provided:scope.vm.provided
                    };
                    //this really should be in the controller
                    networkProvider.updateProviderForm(scope.vm.receiversid,scope.vm.providersid,response)
                        .then(function(response){
                            notificationService.createNotification("Form saved successfully","success");
                            // this does seem to be sort of working, need to revisit $window.close();
                            //TODO:window close.
                        });

                })


            }
            return {
                restrict:'A',
                link:link,
                scope:{
                    vm:"="
                }
            }
        }])
})();