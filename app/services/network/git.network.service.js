/**
 * Created by adamellis on 14/03/2017.
 */
(function(){
    angular
        .module('PeerFeedback')
        .factory('gitNetService',gitNetService);

    gitNetService.$inject = ['$http','NEXUS_GITHUB_ORG','NEXUS_GITHUB_TOKEN'];

    function gitNetService($http,NEXUS_GITHUB_ORG,NEXUS_GITHUB_TOKEN){


        return {
            getContent:getContent,
            getTree:getTree,
            getZip:getZip
        };



        function getTree(aid,sha){
            return gitQuery(`/repos/${NEXUS_GITHUB_ORG}/assignment-${aid}/git/trees/${sha}?recursive=1`)
        }

        function getContent(aid,branch,path){
            return gitQuery(`/repos/${NEXUS_GITHUB_ORG}/assignment-${aid}/contents/${path}`,{ref:branch})
        }

        function gitQuery(queryString,params){
            console.log(params);
            const url = "https://github.kcl.ac.uk/api/v3";
            return $http({
                method: 'GET',
                url: url + queryString,
                headers: {
                    'Authorization': 'token ' + NEXUS_GITHUB_TOKEN,
                    'Accept': 'application/vnd.github.v3.html'
                },
                params:params
            });
        }
    }
}());