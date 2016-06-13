var app = angular.module('TestMod',['ngRoute', 'ui.codemirror', 'toastr']);

var initialString = "public class HelloWorld { \n\n\t" + 
"public static void main(String[] args) { \n\n\t\t" + 
"System.out.println(\"Hello, World\");\n \n\t}\n\n}";

app.controller('ConfigCtrl', function($scope, $http, toastr){
	var th = $scope;

	//Initializations
	th.listOfIOTests = [0];
	th.testTotal = 0;
	th.inputArray = ["Hello, World!"];
	th.outputArray = ["Hello, World!"];
	th.descriptionArray = ["Hello, World! should be print it with no new-line"];
	th.startProcess = true;
	th.loading = false; //loading value for when verify button is clicked
	th.compileError = false;
	th.ranError = false;
	th.allPassed=  false;

	//Add a new set of I/O Test cases;
	th.addTest = function() {
		th.testTotal += 1;
		th.listOfIOTests.push(th.listOfIOTests.length);
		th.inputArray.push("");
		th.outputArray.push("");
		th.descriptionArray.push("");
		console.log(th.listOfIOTests);
	};

	//Create JAVA Like text-area with CodeMirror
	// BEGIN : TextEditor for JAVA
	th.areaTextValue = initialString;
	th.editorOptions = {
		lineWrapping : true,
		lineNumbers: true,
		mode: 'text/x-java',
		dragDrop: true,
		autoCloseBrackets: true
        // allowDropFileTypes Allow only certain types. TODO
    };
    // END
    th.verifyAssingment = function() {
    	th.loading = true;
		//Verifications not to add empty tests
		if (th.listOfIOTests.length == 0) {
			//To add Toastr
			toastr.error("No I/O Tests inserted");
			th.loading = false;
		} else {
			//TODO HTTP Request
			var obj = {
				input : th.inputArray,
				output : th.outputArray,
				description : th.descriptionArray,
				code: th.areaTextValue
			};

			$http.post("/check-educator-code", obj).success(function(response) {
				th.loading = false;
				th.startProcess = false;
				console.log(response.resultsArray);

				if (response.compiled.bool == false) {
					th.compileError = true;
					toastr.error("Error. Please see bottom of the page for details");
					th.errorMessage = response.compiled.error;
				} else {
					th.compileError = false;
					th.table = response.resultsArray;
					th.allPassed = response.allPassed;

				}
			}).error(function(status) {
				toastr.error("Error - HTTP Post Request");
			});  
		}
	};
	th.cancel = function() {
		alert("Nothing to do for that");
	}
});