var app = angular.module('EduCreateIoAssignment', ['toastr']);

var initialString = "public class HelloWorld { \n\n\t" + 
"public static void main(String[] args) { \n\n\t\t" + 
"System.out.println(\"Hello, World\");\n \n\t}\n\n}";

app.controller('EduCreateIoAssignmentCtrl', function($scope, $http, toastr){
	var th = $scope;

	//INITIALIZATIONS
	th.assingmentTitle = "";
	th.listOfDictionaries = [];
	
	$http.get('/get-dictionaries').success(function(response) {
		th.listOfDictionaries = response;
	}).error(function(status) {
		toastr.error("Could not retrieve dictionaries.");
	});

	th.knumber = 'k1332897';
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

	th.typeOfAssignment = "";

	//CodeMirror
	th.class_name = "";

	//I/O Testing
	th.listOfIOTests = [0];
	th.testTotal = 0;
	th.inputArray = ["Hello, World!"];
	th.outputArray = ["Hello, World!"];
	th.descriptionArray = ["Hello, World! should be printed with no new-line"];
	
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
	th.formula = th.knumber.substring(1,th.knumber.length) + " mod 50";

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
	};

	th.addNewDictionary = function() {
		var obj = {
			knumber: th.knumber,
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
	};
	//Add a new set of I/O Test cases;
	th.addTest = function() {
		th.testTotal += 1;
		th.listOfIOTests.push(th.listOfIOTests.length);
		th.inputArray.push("");
		th.outputArray.push("");
		th.descriptionArray.push("");
	};

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

		//TYPE 1
		if (!th.checkUseOutput && !th.checkUseInput) {
			th.typeOfAssignment = "Compile and Run users files with NO input/output verification."
			toastr.warning("In this way only compilation and run will be tested with no verification on results. Please wait for modal to appear.");
			var objToSend = {
				dataFilesArray: th.filesArray,
				id: 'k1332897',
			};
			//Check Educator's Code
			$http.post("/check-educator-code-no-input-no-output", objToSend).success(function(response) {
				th.response = response;
				console.log(response);
				$('#previewModal').modal('show');
			}).error(function(status) {
				toastr.error("ERROR - HTTP Request");
			}); 
		} 
		//TYPE 2
		else if (!th.checkUseInput){
			th.typeOfAssignment = "Compile, Run and Output Verification "
			toastr.warning("Results based on dictionary will be tested.");

		} 
		//Type 3
		else if (th.checkUseInput && th.checkUseOutput){
			toastr.warning("I/O + Unique Assignments Tested");
			th.typeOfAssignment = "Compile and Run based on I/O testing.";
			console.log(th.previewRequirement);
			var objToSend = {
				id: 'k1332897',
				inputArray: th.inputArray,
				outputArray: th.outputArray,
				descriptionArray: th.descriptionArray,
				dictionariesArray: th.listOfDictSelected,
				dataFilesArray: th.filesArray,
				formula: th.formula
			};

			//Check Educator's Code
			$http.post("/check-educator-code-io-input-output", objToSend).success(function(response) {
				th.response = response;
				$('#previewModal').modal('show');
			}).error(function(status) {
				toastr.error("ERROR - HTTP Request");
			});
		} else {
			//ERROR TYPE
			toastr.error("You cannot select ONLY Input Format");
		}
	}

	th.addAssignment = function() {
		console.log("Adding");
	}
	///////////////////////////////////////////////END: FUNCTIONS for creating and verifying assignments
});
