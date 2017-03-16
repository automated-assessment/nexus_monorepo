/**
 * Created by adamellis on 15/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .factory('providerForm',providerForm);


    function providerForm(){
        return {
            save:save
        };

        function save(container,json){
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
        }

        function disable(){
            //TODO: Disable the form
        }
    }
}());