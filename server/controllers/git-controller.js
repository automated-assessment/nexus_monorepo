/**
 * Created by adamellis on 19/03/2017.
 */

const gitUtils = require('../utilities/git-utils');
const submissionsController = require('./submissions-controller');

module.exports.getGitSubmission = function (req, res) {
    let auth = false;
    let studentAuth;
    if (req.user.email) {
        auth = true;
    }
    if (!auth && req.user.sid) {
        studentAuth = submissionsController.queryReceivers({providerSid: req.user.sid}, {null: 0})
            .then(function (response) {
                const receivers = response.receivers;
                for (let i = 0; i < receivers.length; i++) {
                    if (receivers[i].receiverSid === Number(req.params.sid)) {
                        auth = true;
                    }
                }
            });
    }

    Promise.resolve(studentAuth)
        .then(function () {
            if (auth) {
                const gitData = submissionsController.getGitData(req.params.sid)
                    .then(function (response) {
                        if (response.cloneurl) {
                            response.cloneurl = parseClone(response.cloneurl);
                            gitUtils.getSubmission(response.cloneurl, response.branch, response.sha)
                                .then(function (response) {
                                    res.send(response);
                                })
                        } else {
                            res.send();
                        }
                    });
            } else {
                res.status(401).send("Unauthorised");
            }
        })
};


function parseClone(url) {
    const splitSlash = url.split('/');
    let repoUrl = splitSlash[splitSlash.length - 1];
    repoUrl = repoUrl.substring(0, repoUrl.length - 4);
    return repoUrl;
}





