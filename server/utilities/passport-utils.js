/**
 * Created by adamellis on 05/04/2017.
 */

"use strict";

const BasicStrategy = require('passport-http').BasicStrategy;
const Submission = require('../datasets/submissionModel');
const Assignment = require('../datasets/assignmentModel');
const academicToken = process.env.ACADEMIC_TOKEN;

module.exports.studentStrategy = new BasicStrategy(
    function (sid, token, done) {
        Submission.findOne({sid: sid})
            .then(function (submission) {
                if (!submission) {
                    return done(null, false);
                }
                if (submission.verifyToken(token)) {
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
//can either authenticate on behalf of submission or as aid
module.exports.academicStrategy = new BasicStrategy(
    function (id, password, done) {
        if (!id) {
            return done(null, false);
        }
        const testAssignment = Assignment.findOne({aid: id})
            .then(function (assignment) {
                if (assignment && password === academicToken) {
                    return done(null, assignment);
                } else if (password === academicToken) {
                    return done(null, true);
                } else {
                    return done(null, false);
                }
            },function(error){
                return done(null,false);
            });
    }
);
