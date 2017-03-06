/**
 * Created by adamellis on 05/03/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .factory('parser',function(){

            const receiverSubmissions = function(responseData){
                return responseData;
                // console.log("receiver",responseData);
            };

            const providerSubmissions = function(responseData){
                return responseData;
                // console.log("original",responseData);
                // const retObj = {
                //     sid:responseData[0].providers[0].providersid
                // };
                // const receivers = [];
                // responseData.forEach(function(submission){
                //     const receiverObj = {};
                //     //inverting the object
                //     for(let prop in submission){
                //         if(prop !== "providers"){
                //             receiverObj[prop] = submission[prop];
                //         }
                //     }
                //
                //     console.log(submission);
                //     //console.log(submission);
                //     //relational data
                //     // for(let prop in submission){
                //     //     if(prop!= "providersid"){
                //     //             console.log(submission.providers[0][prop]);
                //     //             receiverObj[prop] = submission.providers[0][prop];
                //     //     }
                //     //
                //     //
                //     // }
                //     receivers.push(receiverObj);
                // });
                // retObj.receivers = receivers;
                // console.log("provider",retObj);


            };

            return {
                receiverSubmissions:receiverSubmissions,
                providerSubmissions:providerSubmissions
            }
        });
}());