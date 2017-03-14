/**
 * Created by adamellis on 12/03/2017.
 */
const mongoose = require('mongoose');
module.exports = mongoose.model('Allocation',{
    receiverSid:Number,
    providerSid:Number,
    currentForm:String,
    dateAllocated:Date,
    dateModified:Date,
    alias:String,
    provided:Boolean
});