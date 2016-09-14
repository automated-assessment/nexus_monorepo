var app = angular.module('ListAssignmentsModule',[]);

app.controller('ListAssingmentsCtrl', function($scope, $http, $location, toastr){
    var th = $scope;

    $http.get("/get-assignments").success(function(response) {
        th.listOne = response.typeone;
        console.log(th.listOne[0]._id);
        th.listTwo = response.typetwo;
        th.listThree = response.typethree;
    }).error(function(status) {
        toastr.error("Error - HTTP Post Request");
    });  
});