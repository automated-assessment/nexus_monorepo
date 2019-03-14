CXX=g++
CXXFLAGS=-Wall -O -std=c++11

all: $(patsubst %.cpp, $(TARGET_DIR)%.o, $(wildcard *.cpp))

$(TARGET_DIR)%.o: %.cpp Makefile
	$(CXX) $(CXXFLAGS) $< -o $(@:.o=)

clean: $(patsubst %.cpp, %.clean, $(wildcard *.cpp))

%.clean:
	rm -f $(@:.clean=)