#include <cppunit/TestCase.h>
#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>
#include <cppunit/extensions/TestFactoryRegistry.h>
using namespace CppUnit;

#include "complex.h"

class TestSpecification : public TestFixture {
  CPPUNIT_TEST_SUITE(TestSpecification);
  CPPUNIT_TEST(testReal);
  CPPUNIT_TEST(testImaginary);
  CPPUNIT_TEST_SUITE_END();
  Complex *c;

public:
    void setUp(void);
    void tearDown(void);

protected:
    void testReal(void);
    void testImaginary(void);
    void testEqual(void);
};


void TestSpecification::testReal(void)
{
    CPPUNIT_ASSERT(5 == c->getReal());
}

void TestSpecification::testImaginary(void)
{
    CPPUNIT_ASSERT(1 == c->getImaginary());
}

void TestSpecification::testEqual(void)
{
    Complex c2(5,1);
    CPPUNIT_ASSERT(*c == c2);

    Complex c3(3,2);
    CPPUNIT_ASSERT(!(*c == c3));
}

void TestSpecification::setUp(void)
{
  c = new Complex(5,1);
}

void TestSpecification::tearDown(void)
{
    delete c;
}

CPPUNIT_TEST_SUITE_REGISTRATION(TestSpecification);