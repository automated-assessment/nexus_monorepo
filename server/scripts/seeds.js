/**
 * Created by adamellis on 08/02/2017.
 */

require('dotenv').config();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const dbHost = process.env.DB_HOST;
const Submission = require('../datasets/submissionModel');

mongoose.connect(`mongodb://${dbHost}/peerfeedback`);

mongoose.connection.collections['submissions'].drop(createDb());

function createDb(){
    var i =0;
    for(let i=0;i<4;i++){
        var submission = new Submission();
        submission.aid=1;
        submission.studentuid=i;
        submission.pid = [];
        submission.save();
    }

}



mongoose.disconnect();


// .catch(function(err){
//     console.log(err);
// })
//     .then(function(response){
//         console.log("Deleted successfully");
//     });