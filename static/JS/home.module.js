var app = angular.module('HomeModule',[]);

app.controller('HomeCtrl', function($scope, $location){
    var th = $scope;
    th.redirect = function(path) {
        $location.path(path);
    }
});