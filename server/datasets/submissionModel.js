/**
 * Created by adamellis on 06/02/2017.
 */

//This needs editing to remove any data that is not required.
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    //The unique of the submission.
    sid: Number,
    //The referential id of the assignment.
    aid: Number,
    //The name of the student.
    student: String,
    //The Neuxs unique id of the student.
    studentuid: Number,
    //The email of the student.
    studentemail: String,
    //The SHA-1 for the student's git submission commit.
    sha: String,
    //The git branch the student has committed their work to.
    branch: String,
    //The clone url of the repository, used to extract the repository.
    cloneurl: String,
    //The randomly generated, unique cryptographic key used to authorise
    //the submitting student to view this submission, their receivers and their providers.
    token: String,
    //The date the submission was created.
    dateCreated: String,
    //The email of the academic to uniquely identify the academic
    academicEmail:String,
    //The submission has been successfully allocated
    isAllocated:Boolean
});
submissionSchema.methods.verifyToken = function(candidatetoken){
    return this.token === candidatetoken;
};

module.exports = mongoose.model('Submission',submissionSchema);
