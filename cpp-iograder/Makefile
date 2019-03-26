CXX=g++
CXXFLAGS=-Wall -O -std=c++11

# Compile all C++ files found into separate executables.
# Output executables are stored in TARGET_DIR directory if specified,
# else current directory is used instead.
all: $(patsubst %.cpp, $(TARGET_DIR)%.o, $(wildcard *.cpp))

$(TARGET_DIR)%.o: %.cpp Makefile
	$(CXX) $(CXXFLAGS) $< -o $(@:.o=)

clean: $(patsubst %.cpp, %.clean, $(wildcard *.cpp))

%.clean:
	rm -f $(@:.clean=)