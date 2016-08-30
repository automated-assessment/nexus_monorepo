var app = angular.module('AssignmentModule',['ngRoute', 'ui.codemirror', 'toastr']);

var initialString = "public class HelloWorld { \n\n\t" + 
"public static void main(String[] args) { \n\n\t\t" + 
"System.out.println(\"Hello, World\");\n \n\t}\n\n}";

app.controller('AssignmentCtrl', function($scope, $http, $location, toastr){
	var th = $scope;
	// console.log($location.search());
});