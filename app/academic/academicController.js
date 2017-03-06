/**
 * Created by adamellis on 03/03/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('academicController',['allSubmissions',function(allSubmissions){

            const vm = this;

            vm.submissions = allSubmissions.data;

        }]);
}());