//Used exclusively in form related queries

const Assignment = require('../datasets/assignmentModel');
const jsonMinify = require('jsonminify');

module.exports.createConfig = function(req,res){
    req.body.formBuild = jsonMinify(req.body.formBuild);
    const assignment = new Assignment(req.body);
    assignment.save()
        .then(
            function(){
                res.sendStatus(200);
        },
            function(){
                res.sendStatus(400);
            }
        );

};


