/**
 * Created by adamellis on 17/02/2017.
 */
const sender = require('./response-helper');

module.exports.response = function(req){
    // sender.sendMark(10, req.body.sid,function(err,res,body){
    // });
    const aid = req.body.aid;
    const studentuid = req.body.studentuid;
    const sid = req.body.sid;
    const html = `<iframe src='http://localhost:3050/#!/allocation?studentuid=${studentuid}&aid=${aid}&sid=${sid}' width="1000" height="500"></iframe>`;
    sender.sendFeedback(html,req.body.sid,function(err,res,body){
    });
};

