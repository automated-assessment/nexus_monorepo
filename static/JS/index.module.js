var app = angular.module('IndexModule',['ngRoute', 'ui.codemirror', 'toastr', 'ConfigModule', 
	'EduCreateIoAssignment', 'AssignmentModule']);


app.config(['$routeProvider', function($routeProvider, $location) {
	$routeProvider.
	when('/config', {
		templateUrl: '/config.html',
		controller: 'ConfigCtrl'
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
	when('/test/?', {
		templateUrl: '/view-assignment.html',
		controller: 'AssignmentCtrl'
	}).
	otherwise({
		redirectTo: '/404'
	});
}]);



