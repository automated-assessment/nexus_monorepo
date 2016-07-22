var app = angular.module('EduCreateIoAssignment', ['toastr', 'ui.codemirror', 'ngSanitize']);

var initialString = "public class HelloWorld { \n\n\t" + 
"public static void main(String[] args) { \n\n\t\t" + 
"System.out.println(\"Hello, World\");\n \n\t}\n\n}";

app.controller('EduCreateIoAssignmentCtrl', function($scope, $http, $cookies, $location, toastr){
	var th = $scope;
	//INITIALIZATIONS
	th.assingmentTitle = "";
	th.listOfDictionaries = [];
	
	$http.get('/get-dictionaries').success(function(response) {
		th.listOfDictionaries = response;
	}).error(function(status) {
		toastr.error("Could not retrieve dictionaries.");
	});

	th.requirement = "";
	th.previewRequirement = "";
	th.newDictName = "";
	th.parsedOk = false;
	th.dictWordsArea = "";
	th.listOfDictSelected = [];
	th.listOfWordsParsed = [];

	th.inputText = "";
	th.inputExample = "";
	th.outputText = "";
	th.outputExample = "";

	//CodeMirror
	th.class_name = "";

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

	//TODO GET FROM USER
	th.formula = "knumber mod 50"
	
	///////////////////////////////////////////////BEGIN: FUNCTIONS For Dictionary
	th.addDictionary = function(dictionary) {
		var newobj = {
			id: "#" + (th.listOfDictSelected.length+1),
			dictionary : dictionary
		}
		th.listOfDictSelected.push(newobj);
	}

	th.openModalNewDict = function() {
		$('#newDictModal').modal('show');
		th.parsedOk = false;
		th.newDictName = "";
		th.dictWordsArea = "";
		th.listOfWordsParsed = [];
	}
	th.parseWords = function(textToParse) {
		th.listOfWordsParsed = textToParse.split(",");
		th.parsedOk = true;
	}

	th.addNewDictionary = function() {
		var obj = {
			knumber: $cookies.get('harena-id'),
			dictionary:{
				name: th.newDictName,
				values: th.listOfWordsParsed
			}
		};
		th.parsedOk = false;
		$http.post("/add-new-dictionary", obj).success(function(response) {
			if (response == "success") {
				toastr.success("Dictionary added successfully");
				th.listOfDictionaries.push(obj.dictionary);
				$('#newDictModal').modal('hide');
			} else {
				toastr.error("DB Error. Please contact Martin.");
			}
		}).error(function(status) {
			toastr.error("ERROR - HTTP Request");
		}); 
	}
	///////////////////////////////////////////////END: FUNCTIONS For Dictionary

	///////////////////////////////////////////////BEGIN: FUNCTIONS For CodeMirror TextArea
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
    th.displayCodeContents = function(index, contents) {
    	th.editorOptionsArray[index].areaText = contents;
    };
    ///////////////////////////////////////////////END: FUNCTIONS For CodeMirror TextArea

	///////////////////////////////////////////////BEGIN: FUNCTIONS for creating and verifying assignments
	th.checkValues = function() {
		//Replace #index with words from dict based on edu knumber for example
		//Calculate index
		var formula = 1;
		th.previewRequirement = th.requirement;

		th.filesArray = [];

    	//Create obj with code and class names to send 
    	for (var i = 0; i < th.editorOptionsArray.length; ++i) {
    		var obj = {};
    		obj.code = th.editorOptionsArray[i].areaText;
    		obj.class_name = th.editorOptionsArray[i].class_name;
    		th.filesArray.push(obj);
    	}

    	//Create Requirement to be seen
		for (var i = 0; i < th.listOfDictSelected.length; ++i) {
			var hash = "#" + (i+1);
			var re = new RegExp(hash,'g');
			th.previewRequirement = th.previewRequirement.replace(re, th.listOfDictSelected[i].dictionary.values[formula] );
		}
		$('#previewModal').modal('show');
	}

	th.addAssignment = function() {
		console.log("Adding");
	}
	///////////////////////////////////////////////END: FUNCTIONS for creating and verifying assignments
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