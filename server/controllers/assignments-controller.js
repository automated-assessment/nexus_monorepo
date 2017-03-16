/**
 * Created by adamellis on 03/03/2017.
 */

const Assignment = require('../datasets/assignmentModel');

module.exports.getAllAssignments = function(req,res){
    Assignment.find({})
        .then(function(response){
            res.send(response);
        });
};

module.exports.getOneAssignment =  function(req,res){

    const query={
        aid:req.params.aid
    };

    Assignment.findOne(query)
        .then(function(response){
            res.send(response);
        })
};

module.exports.updateAssignment = function(req,res){

    const query = {
        aid:req.params.aid
    };

    const update = req.body;

    const options = {
        upsert:true
    };

    Assignment.findOneAndUpdate(query,update,options)
        .then(function(response){
            res.send(response);

    });


};
