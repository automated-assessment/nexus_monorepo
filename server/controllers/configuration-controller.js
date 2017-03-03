//Used exclusively in form related queries

const Assignment = require('../datasets/assignmentModel');
const jsonMinify = require('jsonminify');

module.exports.getAssignmentConfig = function(req,res){
    Assignment.findOne({aid:req.query.aid})
        .then(function(response){
            res.send(response);
        })
};

module.exports.saveAssignmentConfig = function(req,res){
    if(req.body.aid){
        req.body.formBuild = jsonMinify(req.body.formBuild);
        const assignment = new Assignment(req.body);
        Assignment.findOneAndUpdate({aid:req.body.aid},req.body,{upsert:true})
            .then(function(response){
                res.sendStatus(200);
            })
            .catch(function(response){
                res.sendStatus(400);
            })
    } else {
        res.sendStatus(400);
    }


};



