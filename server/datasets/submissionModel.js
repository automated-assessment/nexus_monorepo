/**
 * Created by adamellis on 06/02/2017.
 */

//This needs editing to remove any data that is not required.
const mongoose = require('mongoose');

module.exports = mongoose.model('Submission',{
    aid:Number,
    sid:Number,
    student:String,
    studentuid:Number,
    studentemail:String,
    branch:String,
    submissionHash:String,
    dateCreated:String
});