/**
 * Created by adamellis on 06/02/2017.
 */
const mongoose = require('mongoose');
module.exports = mongoose.model('Assignment',{
    aid:Number,
    providerCount:Number,
    formBuild:String,
    teacherHash:String,
    awaitBiDirection:Boolean,
    contributeFinalMark:Boolean,
    dateCreated:Date
});

