/**
 * Created by adamellis on 18/03/2017.
 */
(function () {

    angular
        .module('PeerFeedback')
        .factory('snippetsService', snippetsService);

    snippetsService.$inject = ['gitNetService', 'allocationNetService', '$sce'];


    function snippetsService(gitNetService, allocationNetService, $sce) {

        let zip;

        return {
            resolvePaths: resolvePaths,
            getSnippets: getSnippets,
            isZip:isZip

        };

        //this should really be reformatted.
        function getSnippets(aid, branch, sha) {
            return getFileNames(aid, sha)
                .then(function (pathArray) {
                    return getContents(pathArray, branch, aid)
                        .then(function (contentsArray) {
                            return contentsArray;
                        })
                });
        }


        /**
         * @param aid
         * @param sha
         * @returns Promise paths as array
         */
        function getFileNames(aid, sha) {
            return gitNetService.getTree(aid, sha)
                .then(function (response) {
                    return resolvePaths(response.data.tree);
                })
        }

        function isZip(){
            return zip;
        }


        //path from tree
        /**
         * @param fileNames as array
         * @param branch
         * @param aid
         * @returns Promise contents as array
         */
        function getContents(fileNames, branch, aid) {
            const contentArray = [];
            const promiseArray = [];

            if (!containsZip(fileNames)) {
                isZip = false;
                fileNames.forEach(function (fileName) {
                    promiseArray.push(gitNetService.getContent(aid, branch, fileName)
                        .then(function (response) {
                            contentArray.push({fileName: fileName, content: $sce.trustAsHtml(response.data)});
                        }));


                });
            }


            return Promise.all(promiseArray)
                .then(function () {
                    return contentArray;
                })
        }



        function containsZip(fileNames) {
            return fileNames.some(function (fileName) {
                if (fileName.substr(fileName.length - 4) === ".zip") {
                    return zip = true;
                }
            });


        }


        //resolve tree as an array into
        function resolvePaths(tree) {
            const filePaths = [];
            tree.forEach(function (object) {
                if (object.type === "blob") {
                    filePaths.push(object.path);
                }
            });
            return filePaths;
        }

    }
})();



