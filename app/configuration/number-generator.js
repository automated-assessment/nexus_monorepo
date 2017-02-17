/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('StudentCountFactory',function(){
           const studentCount = 8;
           const numbers=[];
           for(let i=2;i<studentCount+1;i++){
               numbers.push(i);
            }
           return numbers;
        });
}());