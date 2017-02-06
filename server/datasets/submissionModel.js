/**
 * Created by adamellis on 06/02/2017.
 */

//This needs editing to remove any data that is not required.
var mongoose = require('mongoose');
module.exports = mongoose.model('Submission',{
    sid:Number,
    aid:Number,
    cloneUrl:String,
    branch:String,
    sha:String
});