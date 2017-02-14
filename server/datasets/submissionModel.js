/**
 * Created by adamellis on 06/02/2017.
 */

//This needs editing to remove any data that is not required.
var mongoose = require('mongoose');

module.exports = mongoose.model('Submission',{
    studentuid:Number,
    studentpid:[],
    sid:Number,
    aid:Number,
    cloneurl:String,
    branch:String,
    sha:String
});