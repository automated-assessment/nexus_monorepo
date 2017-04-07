/**
 * Created by adamellis on 03/04/2017.
 */

const request = require('request-promise');
const OWNER = process.env.NEXUS_GITHUB_ORG;
const TOKEN = process.env.NEXUS_GITHUB_TOKEN;

module.exports.getSubmission = function (repo, branch, sha) {
    return getTree(repo, branch, sha)
        .then(function (response) {
            if(response.error){
                return null;
            }
            response = JSON.parse(response);
            const fileNames = parseTree(response.tree);
            return getContentArray(fileNames, repo,branch);
        });

};

function getContentArray(fileNames,repo,branch) {
    const promiseArray = [];
    const contentArray = [];
    for (let i = 0; i < fileNames.length; i++) {
        const promise = getContents(repo, branch, fileNames[i])
            .then(function (response) {
                const snippet = {
                    fileName: fileNames[i],
                    content: response
                };
                contentArray.push(snippet);
            });
        promiseArray.push(promise);
    }
    return Promise.all(promiseArray)
        .then(function () {
            return contentArray;
        });
}

function getContents(repo, branch, fileName) {
    const query = {
        method: 'GET',
        queryString: `/repos/${OWNER}/${repo}/contents/${fileName}?ref=${branch}`,

    };
    return queryGit(query);
}

function getTree(repo, sha) {
    const query = {
        method: 'GET',
        queryString: `/repos/${OWNER}/${repo}/git/trees/${sha}?recursive=1`
    };

    return queryGit(query);
}

function parseTree(tree) {
    const filePaths = [];
    tree.forEach(function (object) {
        if (object.type === "blob") {
            filePaths.push(object.path);
        }
    });
    return filePaths;
}

// module.exports.getZip = function(req,res){
//     //This will get the zip
// }


//should probably handle all the git stuff here too


function queryGit(query) {

    const options = {
        method: query.method,
        url: `https://github.kcl.ac.uk/api/v3${query.queryString}`,
        headers: {
            'Authorization': `token ${TOKEN}`,
            'Accept': 'application/vnd.github.v3.html'
        },
        resolveWithFullResponse: query.fullResponse || false,
        followRedirect: function (response) {
            return response.headers['location'];
        }
    };

    return request(options)
        .then(function (response) {
            return response;
        }, function (err) {
            return err;
        });
}

