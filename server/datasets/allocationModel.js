/**
 * Created by adamellis on 12/03/2017.
 */
const mongoose = require('mongoose');
module.exports = mongoose.model('Allocation',{
    receiverSid:Number,
    providerSid:Number,
    currentForm:String,
    branch:String,
    sha:String,
    dateAllocated:Date,
    dateModified:Date,
    alias:String,
    provided:Boolean,
    providerMark:Number
});