/**
 * Created by adamellis on 05/04/2017.
 */

const BasicStrategy = require('passport-http').BasicStrategy;
const Submission = require('../datasets/submissionModel');

module.exports.studentStrategy = new BasicStrategy(
    function (sid, token, done) {
        console.log("Wrong one");
        Submission.findOne({sid: sid})
            .then(function (submission) {
                if(!submission){
                    return done(null,false)
                }
                if (submission.verifyPassword(token)) {
                    console.log('accepted');
                    return done(null, submission);
                } else {
                    //verification fails, i.e. password wrong
                    return done(null, false);
                }
            }, function (err) {
                return done(null, false);
            })

    }
);
