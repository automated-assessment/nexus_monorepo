/**
 * Created by adamellis on 19/03/2017.
 */
(function () {
    'use strict';

    angular
        .module('PeerFeedback')
        .filter('firstName', firstName);

    function firstName() {
        return nameFilter;

        ////////////////

        function nameFilter(fullName) {
            const spaceIndex = fullName.indexOf(' ');
            return fullName.substring(0,spaceIndex);
        }
    }

})();

