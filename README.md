## IO-tool
Repository to be used for the NodeJS Application, IO-tool part of KCL Automated Assessements.

###Requirements 
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
Back-end : NodeJS
Front-end : AngularJS + Bootstrap
DB : MongoDB

###Environment Variables (All are mandatory)
PORT - on which application should run;
RAW_PATH - Represents the folder in which sources will be tested(This folder has to exist)
IOTOOL_ID - ID for the IOTOOL which is set in NEXUS
NEXUS_ACCESS_TOKEN - TOKEN Required for validating HTTP Requests between NEXUS and IOTOOL
NEXUS_URL - Nexus base URL(e.g http://localhost:3000/)




