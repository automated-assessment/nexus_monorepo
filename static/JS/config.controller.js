var app = angular.module('ConfigModule',['ngRoute', 'ui.codemirror', 'toastr']);

var initialString = "public class HelloWorld { \n\n\t" + 
"public static void main(String[] args) { \n\n\t\t" + 
"System.out.println(\"Hello, World\");\n \n\t}\n\n}";

app.controller('ConfigCtrl', function($scope, $http, $location, toastr){
	var th = $scope;

	//Initializations
	th.listOfIOTests = [0];
	th.testTotal = 0;
	th.inputArray = ["Hello, World!"];
	th.outputArray = ["Hello, World!"];
	th.descriptionArray = ["Hello, World! should be printed with no new-line"];
	th.class_name = "HelloWorld";
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
	th.areaTextArray = [initialString];
	th.editorOptionsArray = [
		{
			areaText: initialString,
			class_name: 'HelloWorld',
			editorOptions: 
			{
				lineWrapping : true,
				lineNumbers: true,
				mode: 'text/x-java',
				dragDrop: true,
				autoCloseBrackets: true
			}
	    }
	];

    th.displayCodeContents = function(index, contents) {
    	th.editorOptionsArray[index].areaText = contents;
    };
    // END

    //BEGIN : ADD Multiple Java Files
    th.addFile = function() {
    	var objToAdd = {
    		areaText: "//New File to Add",
    		class_name: "",
    		editorOptions: {
				lineWrapping : true,
				lineNumbers: true,
				mode: 'text/x-java',
				dragDrop: true,
				autoCloseBrackets: true
			}
    	}
    	th.editorOptionsArray.push(objToAdd);
    };
    //END : ADD Multiple Java Files
    th.verifyAssingment = function() {
    	th.loading = true;
    	var filesArray = [];
    	//Create obj with code and class names to send 
    	for (var i = 0; i < th.editorOptionsArray.length; ++i) {
    		var obj = {};
    		obj.code = th.editorOptionsArray[i].areaText;
    		obj.class_name = th.editorOptionsArray[i].class_name;
    		filesArray.push(obj);
    	}
		//Verifications not to add empty tests
		// if (th.listOfIOTests.length == 0) {
		// 	//To add Toastr
		// 	toastr.error("No I/O Tests inserted");
		// 	th.loading = false;
		// } else {
			//TODO HTTP Request
			var obj = {
				// assignmentId: $location.search().aid.toString(),
				input : th.inputArray,
				output : th.outputArray,
				description : th.descriptionArray,
				filesArray : filesArray
			};

			$http.post("/check-educator-code", obj).success(function(response) {
				th.loading = false;
				th.startProcess = false;
				console.log(readeresponse);
				toastr.error("Assignment was successfully added.");
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
		// }
	};
	th.cancel = function() {
		alert("Nothing to do for that");
	}
});

app.directive('onReadFile', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            element.bind('change', function(e) {

                var onFileReadFn = $parse(attrs.onReadFile);
                var reader = new FileReader();
                
                reader.onload = function() {
                    var fileContents = reader.result;

                    scope.$apply(function() {
                        onFileReadFn(scope, {
                            'contents' : fileContents
                        });
                    });
                };
                reader.readAsText(element[0].files[0]);
            });
        }
    };
});