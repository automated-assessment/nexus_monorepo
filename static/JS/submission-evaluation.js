var app = angular.module('SubmissionModule', ['ngRoute']);


app.controller('SubmissionController', function($scope, $location, $http) {
	var obj={
		id: "mama"
	};
	$http.post("/mark", obj).success(function(response) {
		
	}).error(function(status) {
	
	});
	console.log("test");
});