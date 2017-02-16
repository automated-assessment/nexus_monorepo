/**
 * Created by adamellis on 15/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .directive('renderForm',function(){

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
                scope.getForm()
                    .then(function(response){
                        elem.formRender({formData:response.data.formBuild,dataType:'json'});
                        const container = elem[0];

                        console.log(container);
                        const json = response.data.formBuild;
                    }).then(scope.saveForm());
            }
            return {
                restrict:'A',
                link:link
            }
        })
}());

/**




});
   **/