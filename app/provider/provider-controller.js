/**
 * Created by adamellis on 06/02/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .controller('ProviderController',['$scope','$http',function($scope, $http){
            var token = "be7549b0fb2ad810c5b2a2a28376ecdac5d47f12";
            var baseUrl = "https://github.kcl.ac.uk/api/v3";
            $http({
                method:'GET',
                url:baseUrl+'/repos/k1461799/peerfeedback/commits',
                headers: {
                    'Content-Type':'application/json',
                    'Authorization': 'token ' + token
                }
            })
                .then(function(response){
                    console.log(response.data);
                })
        }]);
}());


