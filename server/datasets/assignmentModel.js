/**
 * Created by adamellis on 06/02/2017.
 */
const mongoose = require('mongoose');

module.exports = mongoose.model('Assignment',{
    //The unique id of the assignment.
    aid:Number,
    //The maximum number of allocations for a submission
    providerCount:Number,
    //The form as built by the academic, to be used by all providers.
    formBuild:String,
    //The date the assignment configuration was created.
    dateCreated:Date,
    additionalConfiguration:{
        //Represents whether 'await bidirectional feedback' is ticked.
        awaitBiDirection:Boolean,
        //Represents whether 'send final mark to Nexus' is ticked.
        contributeFinalMark:Boolean
    },
    //The academics email address
    email:String
});

