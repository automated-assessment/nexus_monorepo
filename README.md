## IO-Tool - Description
Repository to be used for the NodeJS Application, IO-tool part of KCL Automated Assessements.

IO-Tool is a NodeJS based application which allows educators to configure their own I/O test assignments through a UI build mainly with AngularJS and Bootstrap.

Assignments are saved and stored only if the educators are able to provide their own skeleton codes which passes all their I/O tests. In case the tests fails, feedback is sent to the educator.

###Requirements of pre-installed programs
1.  NodeJS
2.  NPM
3.  MongoDB
More dependencies can be found in 'package.json' which are installed automatically.

###Commands to install the application dependencies
```java
npm i
//The above will install all dependencies found in package.json
```

###Commands to run the application:
```java
node runIO.js
```

###Tools used
- Back-end : NodeJS
- Front-end : AngularJS + Bootstrap
- DB : MongoDB

###Environment Variables (All are mandatory)
- **PORT** - on which application should run (by default 3001)
- **RAW_PATH** - Represents the folder in which sources will be tested (by default 'TestingEnvironment')
- **IOTOOL_ID** - ID for the IOTOOL which is set in NEXUS (by default 'iotool')
- **NEXUS_ACCESS_TOKEN** - TOKEN Required for validating HTTP Requests between NEXUS and IOTOOL
- **NEXUS_URL** - Nexus base URL (By default _http://localhost:3000/_)
- **MONGO_HOST** - host name for mongoDB server (defaults to _localhost_)

###HTTP Endpoints
##### `POST /mark`
```json
//Required parameters:
{
	**sid**: ID of the submission,
    	**aid**: ID of the assignemnt,
    	**cloneUrl**: URL for git repository,
    	**branch**: branch from Git Repository,
    	**sha** 
}
```
- checks for RAW_PATH to exist, otherwise creates it;
- creates the user folder where proccesses will be tested;
- clones the git repository;
- compiles all java classes found;
- runs the class which has the exact same name as source proposed by the educator. (e.g _If the educator submits multiple JAVA files with the main one name being "MainClass", the student needs to have the exact same name for his Main JAVA File_)
- a JSON Object is created with details about the submission;
- mark is calculated based on the cross multiplication formula;
- 2 new requests are made 
	1. report_mark - The mark obtained by the submission is sent to NEXUS;
	2. report_feedback - Feedback about the submission is sent to NEXUS via HTML. JSON Objects are also created and available if necessary.
- returns a : **200 OK* status;

