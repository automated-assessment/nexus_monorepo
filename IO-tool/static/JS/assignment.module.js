var app = angular.module('AssignmentModule',['ngRoute', 'ui.codemirror', 'toastr']);

app.controller('AssignmentCtrl', function($scope, $http, $location, toastr){
	var th = $scope;
	// console.log($location.search());
    obj = {
        id: $location.search().param 
    }
    $http.get("/get-assignment-by-id", obj).success(function(response) {
    }).error(function(status) {
        toastr.error("Error - HTTP Post Request");
    });  
});