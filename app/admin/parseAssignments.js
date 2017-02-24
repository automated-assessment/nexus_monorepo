/**
 * Created by adamellis on 21/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('parseAssignments',function(){
            const parse = function(unparsed){
                const parsedText = {};

                unparsed.provideTo.forEach(function(submission){
                    if(parsedText['assignment' + submission.aid] === undefined) {
                        parsedText['assignment' + submission.aid] = {};
                        parsedText['assignment' + submission.aid].aid = submission.aid;
                    }


                    if(parsedText['assignment' + submission.aid].provideTo === undefined){
                        parsedText['assignment' + submission.aid].provideTo = [];
                    }
                    parsedText['assignment' + submission.aid].provideTo.push(submission);
                });

                unparsed.receivedFrom.forEach(function(submission){
                    if(parsedText['assignment' + submission.aid] === undefined) {
                        parsedText['assignment' + submission.aid] = {};
                        parsedText['assignment' + submission.aid].aid = submission.aid;

                    }


                    if(parsedText['assignment' + submission.aid].receivedFrom === undefined){
                        parsedText['assignment' + submission.aid].receivedFrom = [];
                    }
                    parsedText['assignment' + submission.aid].receivedFrom.push(submission);
                });

                return parsedText;

            };
            return {
                parse:parse
            }
        })
}());