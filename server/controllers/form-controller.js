//Used exclusively in form related queries

var Config = require('../datasets/formModel');
var jsonMinify = require('jsonminify');

module.exports.createConfig = function(req,res){
    req.body.formBuild = jsonMinify(req.body.formBuild);
    var config = new Config(req.body);
    config.save();
    res.json(req.body);
};


