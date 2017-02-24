/**
 * Created by adamellis on 06/02/2017.
 */

//This needs editing to remove any data that is not required.
const mongoose = require('mongoose');

module.exports = mongoose.model('Submission',{
    studentuid:Number,
    providers:[],
    sid:Number,
    aid:Number,
    branch:String
});