/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .factory('gitService',gitService);




    function gitService(){

        //needs to be extracted to env
        const authToken = "be7549b0fb2ad810c5b2a2a28376ecdac5d47f12";

        return {
            getGitFile:getGitFile,
            getGitTree:getGitTree,
            getGitContent:getGitContent,
            gitQuery:gitQuery
        };

        function getGitFile(aid,branch,path){
            return gitQuery(`/repos/NexusDevAdam/assignment-${aid}/contents/${path}`,{ref:branch});


        }

        function getGitTree(){
            //TODO
        }

        function getGitContent(aid, branch){
            return gitQuery(`/repos/NexusDevAdam/assignment-${aid}/contents`,{ref:branch})

        }
        //Git API Query


        function gitQuery(queryString,params){
            const url = "https://github.kcl.ac.uk/api/v3";
            params = params || {};
            return $http({
                method: 'GET',
                url: url + queryString,
                headers: {
                    'Authorization': 'token ' + authToken,
                    'Accept': 'application/vnd.github.v3.html'
                },
                params:params
            })
                .then(function(response){
                    return response;
                })


        }
    }
}());

/**

 **/