CXX = g++
CXXFLAGS = -c -Wall -Wextra
TARGET = 

#get all .cpp files from current directory and sub-directories
SRCS = $(wildcard *.cpp)
#Replace .cpp files with .o files
OBJS = $(patsubst %.cpp,%.o,$(SRCS))

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CXX) -o $@ $^ # $@ = .PHONY		$^= all prerequisites 

%.o %.cpp:
	$(CXX) $(CXXFLAGS) $< # $<= first prerequisite

clean:
	rm -rf $(TARGET) *.o

.PHONY: all clean

