/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('StudentCountFactory',function(){
           var studentCount = 8;
           var numbers=[];
           for(var i=2;i<studentCount+1;i++){
               numbers.push(i);
            };
           return numbers;
        });
}());