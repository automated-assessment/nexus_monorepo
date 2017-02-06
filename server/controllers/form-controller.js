var mongoose = require('mongoose');
var Form = require('../datasets/feedbackforms');

module.exports.createConfig = function(req,res){
    var form = new Form(req.body);
    form.save();
    res.json(req.body);
};