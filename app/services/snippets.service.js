/**
 * Created by adamellis on 18/03/2017.
 */
(function () {
    'use strict';

    angular
        .module('PeerFeedback')
        .factory('snippetsService', snippetsService);

    snippetsService.$inject = ['gitNetService', 'allocationNetService','$sce'];


    function snippetsService(gitNetService, allocationNetService,$sce) {
        return {
            resolvePaths: resolvePaths,
            getSnippets: getSnippets
        };

        //this should really be reformatted.
        function getSnippets(receiverSid, providerSid,aid) {
            return allocationNetService.getOneAllocation(receiverSid, providerSid)
                .then(function (response) {
                    const branch = response.data.branch;
                    const sha = response.data.sha;
                    return getFileNames(aid,sha)
                        .then(function (pathArray) {
                            return getContents(pathArray,branch,aid)
                                .then(function (contentsArray) {
                                    return contentsArray;
                                })
                        })
                });
        }


        /**
         * @param aid
         * @param sha
         * @returns Promise paths as array
         */
        function getFileNames(aid,sha) {
            return gitNetService.getTree(aid, sha)
                .then(function (response) {
                    console.log(response.data);
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
        function getContents(fileNames,branch,aid) {
            const contentArray = [];
            const promiseArray = [];
            fileNames.forEach(function (fileName) {
                if(!isZip(fileName)){
                    promiseArray.push(gitNetService.getContent(aid, branch, fileName)
                        .then(function (response) {
                                contentArray.push({fileName:fileName,content:$sce.trustAsHtml(response.data)});
                        }))
                } else {
                    //TODO: need to handle zips
                }

            });
            return Promise.all(promiseArray)
                .then(function () {
                    return contentArray;
                })
        }

        function isZip(fileName){
           return (fileName.substr(fileName.length-4)) === ".zip";
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



