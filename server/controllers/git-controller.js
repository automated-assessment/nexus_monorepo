/**
 * Created by adamellis on 19/03/2017.
 */

const gitUtils = require('../utilities/git-utils');
const submissionsController = require('./submissions-controller');
const allocationsController = require('./allocations-controller');

module.exports.getGitSubmission = function (req, res) {
    //need to confirm that this user is a provider
    allocationsController.queryReceivers({providerSid: req.user.sid})
        .then(function (response) {
            let auth = false;
            const receivers = response.receivers;

            for (let i = 0; i < receivers.length; i++) {
                if (receivers[i].receiverSid === Number(req.params.receiverSid)) {
                    auth = true;
                }
            }
            if (auth) {
                const gitData = submissionsController.getGitData(req.params.receiverSid)
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
        });

};

//TODO:Unconfuse receiverSid and providerSid

function parseClone(url) {
    const splitSlash = url.split('/');
    let repoUrl = splitSlash[splitSlash.length - 1];
    repoUrl = repoUrl.substring(0, repoUrl.length - 4);
    return repoUrl;
}





