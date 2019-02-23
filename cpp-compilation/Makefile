#SRCDIR := .
SRCDIR := /usr/src/app
OBJDIR := obj
DEPDIR := dep

CXX = g++
SRCS     := $(shell find $(SRCDIR) -name "*.cpp")
OBJS     := $(SRCS:$(SRCDIR)/%.cpp=$(OBJDIR)/%.o)
DEPS     := $(SRCS:$(SRCDIR)/%.cpp=$(DEPDIR)/%.d)
TREE     := $(patsubst %/,%,$(dir $(OBJS)))
CPPFLAGS  = -MMD -MP -MF $(@:$(OBJDIR)/%.o=$(DEPDIR)/%.d)
CXXFLAGS += -std=c++14

.PHONY: all clean

all: $(OBJS)

.SECONDEXPANSION:
$(OBJDIR)/%.o: $(SRCDIR)/%.cpp | $$(@D)
    $(CXX) $(CPPFLAGS) $(CXXFLAGS) -o $@ -c -Wall -Wextra $<

$(TREE): %:
    mkdir -p $@
    mkdir -p $(@:$(OBJDIR)%=$(DEPDIR)%)

clean:
    $(RM) -r $(OBJDIR) $(DEPDIR)

ifeq "$(MAKECMDGOALS)" ""
-include $(DEPS)
endif
