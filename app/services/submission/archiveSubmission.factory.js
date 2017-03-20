/**
 * Created by adamellis on 20/03/2017.
 */
(function () {
    'use strict';

    angular
        .module('PeerFeedback')
        .factory('archiveSubmission', archiveSubmission);

    archiveSubmission.$inject = [];

    /* @ngInject */
    function archiveSubmission() {

        let zip;

        return {
            checkForZip: checkForZip,
            isZip: isZip
        };

        function checkForZip(fileNames) {
            zip = false;
            fileNames.some(function (fileName) {
                if (fileName.substr(fileName.length - 4) === ".zip") {
                    zip = true;

                }
            });
        }

        function isZip() {
            return zip;
        }
    }

})();

