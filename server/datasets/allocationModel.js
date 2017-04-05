/**
 * Created by adamellis on 12/03/2017.
 */
const mongoose = require('mongoose');

module.exports = mongoose.model('Allocation',{
    //The referential submission id of the receiver.
    receiverSid:Number,
    //The referential submission id of the provider.
    providerSid:Number,
    //The current feedback form from the provider.
    currentForm:String,
    //The date the allocation was created.
    dateAllocated:Date,
    //The date the allocation was modified (for example
    // updating the currentForm).
    dateModified:Date,
    //The alias assigned to the allocation. This alias will be
    //viewed by the provider when providing feedback and by the
    //receiver when viewing feedback.
    alias:String,
    //Represents whether the provider has provided feedback.
    provided:Boolean,
    //The mark given to the receiver by the provider.
    providerMark:Number,
    //The receiver's report
    receiverReport:{
        report:Boolean,
        reason:String
    },
    //The provider's report
    providerReport:{
        report:Boolean,
        reason:String
    }
});