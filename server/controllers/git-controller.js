/**
 * Created by adamellis on 19/03/2017.
 */

const gitUtils = require('../utilities/git-utils');
const submissionsController = require('./submissions-controller');
module.exports.getArchiveLink = function(req,res){
    // const queryString = `/repos/${owner}/${req.params.repo}/zipball/${req.params.branch}`;
    // const options = {
    //     resolveWithFullResponse:true,
    //     followRedirect:function(response) {
    //         return response.headers['location'];
    //     }
    // };
    // queryGit(queryString, options)
    //     .then(function(response){
    //         res.send(response);
    //     })

};

module.exports.getGitSubmission = function(req,res){
    const gitData = submissionsController.getGitData(req.params.sid)
        .then(function(response){
            if(response.cloneurl){
                response.cloneurl = parseClone(response.cloneurl);
                gitUtils.getSubmission(response.cloneurl,response.branch,response.sha)
                    .then(function(response){
                        res.send(response);
                    })
            } else {
                res.send();
            }
        });
};

function parseClone(url){
    const splitSlash = url.split('/');
    let repoUrl = splitSlash[splitSlash.length-1];
    repoUrl = repoUrl.substring(0,repoUrl.length-4);
    return repoUrl;
}





