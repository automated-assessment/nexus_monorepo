/**
 * Created by adamellis on 05/04/2017.
 */

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
                return assignment
            });
        testAssignment.then(function (potentialAssignment) {
                if (potentialAssignment) {
                    if (password === academicToken) {
                        return done(null, potentialAssignment);
                    }
                }
                Submission.findOne({sid: id})
                    .then(function (submission) {
                        if (submission) {
                            Assignment.findOne({aid: submission.aid})
                                .then(function (assignment) {
                                    if (password === academicToken && assignment.email === submission.academicEmail) {
                                        return done(null, submission);
                                    } else {
                                        return done(null, false);
                                    }
                                }, function (err) {
                                    return done(null, false);
                                });
                        } else {
                            return done(null,false);
                        }

                    },function(err){
                        return done(null,false);
                    })
            }
        )
    }
);
