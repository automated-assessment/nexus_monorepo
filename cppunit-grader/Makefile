CXX=g++
CXXFLAGS=-Wall -O -std=c++11

all: $(patsubst %.cpp, $(TARGET_DIR)%.o, $(wildcard *.cpp))

$(TARGET_DIR)%.o: %.cpp Makefile
	$(CXX) $(CXXFLAGS) $< -o $(@:.o=)

clean: $(patsubst %.cpp, %.clean, $(wildcard *.cpp))

%.clean:
	rm -f $(@:.clean=)

.PHONY: all clean

LINK_TARGET = $(TARGET_DIR)testrunner

OBJS = \
	TestRunner.cpp \
	TestSpecification.cpp 

unitTestTarget: $(LINK_TARGET)
	echo "Done"

$(LINK_TARGET): $(OBJS)
	$(CXX) -std=c++11 -I$(HEADER_FOLDER) $^ -lcppunit -o $@