/**
 * Created by adamellis on 06/02/2017.
 */
var mongoose = require('mongoose');
module.exports = mongoose.model('ConfiguredForm',{
    aid:Number,
    providerCount:Number,
    formBuild:String
});

