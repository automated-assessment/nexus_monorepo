var app = angular.module('IndexModule',['ngRoute', 'ui.codemirror', 'toastr', 'ConfigModule', 'SubmissionModule']);


app.config(['$routeProvider', function($routeProvider, $location) {
	$routeProvider.
	when('/config', {
		templateUrl: '/config.html',
		controller: 'ConfigCtrl'
	}).
	when('/404', {
		templateUrl: '404.html'
	}).
	when('/mark', {
		resolve: {
			redirect: function ($route, $location, $http) {
				var obj={
					id: "mama"
				};
				
				$http.post("/mark", obj).success(function(response) {
					console.log(response);
				}).error(function(status) {

				});
			}
		}
	}).
	otherwise({
		redirectTo: '/404'
	});
}]);



