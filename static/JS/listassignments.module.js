var app = angular.module('ListAssignmentsModule',[]);

app.controller('ListAssingmentsCtrl', function($scope, $http, $location, toastr){
    var th = $scope;

    $http.get("/get-assignments").success(function(response) {
        th.listOne = response.typeone;
        console.log("Type 1 Assignments");
        console.log(response.typeone);
    }).error(function(status) {
        toastr.error("Error - HTTP Post Request");
    });  
});