/**
 * Created by adamellis on 05/04/2017.
 */

const BasicStrategy = require('passport-http').BasicStrategy;
const Submission = require('../datasets/submissionModel');
const Assignment = require('../datasets/assignmentModel');
const academicToken = process.env.ACADEMIC_TOKEN;

module.exports.studentStrategy = new BasicStrategy(
    function (sid, token, done) {
        console.log("Hit student strategy");
        Submission.findOne({sid: sid})
            .then(function (submission) {
                if(!submission){
                    return done(null,false);
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

module.exports.academicStrategy = new BasicStrategy(
    function(aid,password,done){
        console.log("Hit academic strategy");
        Assignment.findOne({aid:aid})
            .then(function(assignment){
                if(!assignment){
                    return done(null,false);
                }
                if(password === academicToken && assignment.verifyEmail(assignment.email)){
                    console.log("hit");
                    return done(null,assignment);
                } else {
                    return done(null,false);
                }
            }, function(err){
                return done(null,false);
            });

    }
);
