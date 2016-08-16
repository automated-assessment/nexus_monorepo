var app = angular.module('IndexModule',['ngRoute', 'ui.codemirror', 'toastr', 'ConfigModule', 'EduCreateIoAssignment']);


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
	otherwise({
		redirectTo: '/404'
	});
}]);



