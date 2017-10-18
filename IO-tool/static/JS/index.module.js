var app = angular.module('IndexModule',['ngRoute', 'ui.codemirror', 'toastr', 'ConfigModule', 
	'EduCreateIoAssignment', 'AssignmentModule', 'HomeModule', 'ListAssignmentsModule']);


app.config(['$routeProvider', function($routeProvider, $location) {
	$routeProvider.
	when('/', {
		templateUrl: 'home.html',
		controller: 'HomeCtrl'
	}).
	when('/config', {
		templateUrl: 'config.html',
		controller: 'ConfigCtrl'
	}).
	when('/list-assignments', {
		templateUrl: 'list_assignments.html',
		controller: 'ListAssingmentsCtrl'
	}).
	when('/iotool', {
		templateUrl: '/io-assignment.html',
		controller: 'EduCreateIoAssignmentCtrl'
	}).
	when('/404', {
		templateUrl: '404.html'
	}).
	when('/complex', {
		templateUrl: '/io-assignment.html',
		controller: 'EduCreateIoAssignmentCtrl'
	}).
	when('/assginment/?', {
		templateUrl: '/view-assignment.html',
		controller: 'AssignmentCtrl'
	}).
	otherwise({
		redirectTo: '/404'
	});
}]);



