var app = angular.module('IndexModule',['ngRoute', 'ui.codemirror', 'toastr']);
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/config', {
		templateUrl: 'config.html',
		controller: 'ConfigCtrl'
	}).
	when('/404', {
		templateUrl: '404.html'
	}).
	otherwise({
		redirectTo: '/404'
	});
}]);

