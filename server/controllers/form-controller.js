//Used exclusively in form related queries

var Config = require('../datasets/formModel');


module.exports.createConfig = function(req,res){
    var config = new Config(req.body);
    config.save();
    res.json(req.body);
};


