/**
 * Created by adamellis on 03/03/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('academicController',['allSubmissions','$document',function(allSubmissions,$document){

            //console.log($document.find("#testing"));
            const vm = this;
            console.log(allSubmissions.data);
            vm.submissions = allSubmissions.data;

        }]);
}());