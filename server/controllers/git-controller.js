/**
 * Created by adamellis on 19/03/2017.
 */
const request = require('request-promise');
const owner = process.env.NEXUS_GITHUB_ORG;
const token = process.env.NEXUS_GITHUB_TOKEN;

module.exports.getArchiveLink = function(req,res){
    let path = "";
    const queryString = `/repos/${owner}/${req.params.repo}/zipball/${req.params.branch}`;

    const options = {
        url:'https://github.kcl.ac.uk/api/v3'+queryString,
        headers:{
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3.raw'
        },
        resolveWithFullResponse:true,
        followRedirect:function(response){
           path = response.headers['location'];
           return true;
        }
    };
    request(options)
        .then(function(response){
            res.send(path);
        });
};

