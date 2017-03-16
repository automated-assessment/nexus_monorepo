/**
 * Created by adamellis on 16/03/2017.
 */
(function () {
    'use strict';

    angular
        .module('PeerFeedback')
        .filter('percent', percent);

    function percent() {
        return percentFilter;

        ////////////////

        function percentFilter(number) {
            if(number === null){
                return "";
            } else {
                return number+"%";
            }

        }
    }

})();

