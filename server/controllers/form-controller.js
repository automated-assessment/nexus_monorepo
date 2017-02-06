var mongoose = require('mongoose');
var Config = require('../datasets/formModel');
var Submission = require('../datasets/submissionModel');



module.exports.createConfig = function(req,res){
    var config = new Config(req.body);
    config.save();
    res.json(req.body);
};

module.exports.createSubmission = function(req,res){
    var submission = new Submission(req.body);
    submission.save();
    res.json(req.body);
};