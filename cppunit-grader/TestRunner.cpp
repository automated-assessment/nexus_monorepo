#include <cppunit/BriefTestProgressListener.h>
#include <cppunit/CompilerOutputter.h>
#include <cppunit/extensions/TestFactoryRegistry.h>
#include <cppunit/TestResult.h>
#include <cppunit/TestResultCollector.h>
#include <cppunit/TestRunner.h>

#include <iostream>
using std::cout;
using std::endl;
#include <math.h>
#include <string>
using std::string;
#include <fstream>
#include <sstream>


// write given data to the given file.
    int writeToFail(string file, string data) {
        std::ofstream myfile (file);
        if (myfile.is_open())
        {
            myfile << data;
            myfile.close();
        } 
        else cout << "Unable to open file";
        myfile.close();
        return 0;
    }

int
main( int argc, char* argv[] )
{
  // Create the event manager and test controller
  CPPUNIT_NS::TestResult controller;

  // Add a listener that colllects test result
  CPPUNIT_NS::TestResultCollector result;
  controller.addListener( &result );        

  
  // Add the top suite to the test runner
  CPPUNIT_NS::TestRunner runner;
  runner.addTest( CPPUNIT_NS::TestFactoryRegistry::getRegistry().makeTest() );
  runner.run( controller );

  // Print test in a compiler compatible format. This goes to console log only.
  // Uncomment the 2 lines of code above if want to use.
  //CPPUNIT_NS::CompilerOutputter outputter( &result, std::cerr );
  //outputter.write();  
  

    //computeAndOutputMark 
    int totalTests = result.runTests();
    int marksAchieved = totalTests;
    marksAchieved -= result.testFailures();
    auto mark = (int) round((float(marksAchieved)/totalTests) * 100);
    //cout << "MARK: " << mark << endl;
    writeToFail(argv[1], std::to_string(mark));


    //--------------------------------------------------------------------
    //ProduceFeedback
    
    std::stringstream ss;
    ss << "<div>" << endl;
    if(result.testFailures() == 0) {
        ss << "<p>All tests passed.</p>" << endl;
    } else {
        ss << "<p>" << result.testFailures() << " out of " << result.runTests() << " tests had problems:</p><ol>" << endl;
        ss << "<pre>";
        CPPUNIT_NS::CompilerOutputter outputter2( &result,ss );
        outputter2.write();
        ss << "</pre>" << endl;
        ss << "</ol>" << endl;
    }
    ss << "</div>" << endl;
    string str = ss.str();
    //cout << "Feedback is " << str << endl;
    writeToFail(argv[2], str);


  return 0;
}
