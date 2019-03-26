CXX=g++
CXXFLAGS=-Wall -O -std=c++11

# Compile all files found into separate executables.
# If TARGET_DIR is specified, it is used as a target destination folder,
# else the executables are stored in the current directory.
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

# Compiles all files provided into a single executable file.
# Used for unit-testing.
unitTestTarget: $(LINK_TARGET)
	echo "Done"

# HEADER_FOLDER should guide the compiler into where should it look for the header files if any.
# If no header files leave blank.
$(LINK_TARGET): $(OBJS)
	$(CXX) -std=c++11 -I$(HEADER_FOLDER) $^ -lcppunit -o $@