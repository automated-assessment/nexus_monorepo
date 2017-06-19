/**
 * Created by adamellis on 03/04/2017.
 */

const request = require('request-promise');
const OWNER = process.env.NEXUS_GITHUB_ORG;
const TOKEN = process.env.NEXUS_GITHUB_TOKEN;
module.exports.getSubmission = function (repo, branch, sha) {
    return getTree(repo, branch, sha)
        .then(function (response) {
            if (response.error) {
                return null;
            }
            response = JSON.parse(response);
            const fileNames = parseTree(response.tree);
            return getContentArray(fileNames, repo, branch)
                .then(function(response){
                    return response;
                })
        });

};


function getContentArray(fileNames, repo, branch) {
    const snippets =[];
    let p = Promise.resolve();
    for (let i = 0; i < fileNames.length; i++) {
        p = p
            .then(function () {
                return getContents(repo, branch, fileNames[i])
                    .then(function(response){
                        const snippet = {
                            fileName: fileNames[i],
                            content:response
                        };
                        snippets.push(snippet);
                    });
            });
    }
    return Promise.resolve(p)
        .then(function(response){
            return snippets;
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
