/**
 * Created by adamellis on 18/03/2017.
 */
(function () {

    angular
        .module('PeerFeedback')
        .factory('snippetSubmission', snippetSubmission);

    snippetSubmission.$inject = ['gitNetwork', '$sce', 'archiveSubmission'];


    function snippetSubmission(gitNetwork, $sce, archiveSubmission) {

        return {
            getSnippets: getSnippets
        };

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
            return gitNetwork.getTree(aid, sha)
                .then(function (response) {
                    return resolvePaths(response.data.tree);
                })
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
            archiveSubmission.checkForZip(fileNames);
            if (!archiveSubmission.isZip()) {
                fileNames.forEach(function (fileName) {
                    promiseArray.push(gitNetwork.getContent(aid, branch, fileName)
                        .then(function (response) {
                            contentArray.push({
                                fileName: fileName,
                                content: $sce.trustAsHtml(response.data)
                            });
                        }));
                });
            }
            return Promise.all(promiseArray)
                .then(function () {
                    return contentArray;
                })
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



