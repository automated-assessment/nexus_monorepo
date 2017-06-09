#!/usr/bin/env ruby

#
# Copyright (c) 2014 Martin Sustrik  All rights reserved.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"),
# to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense,
# and/or sell copies of the Software, and to permit persons to whom
# the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
# IN THE SOFTWARE.
#

################################################################################
#  RNA prologue code.                                                          #
################################################################################

# In theory, helpers could be placed into a separate module file to keep
# the RNA lean and tidy, however, embedding the whole thing into each RNA
# file makes the ribosome dependencies and deployment much simpler.

PROLOGUE_LINE = __LINE__
PROLOGUE = '#!/usr/bin/env ruby

#
# The initial part of this file belongs to the ribosome project.
#
# Copyright (c) 2014 Martin Sustrik  All rights reserved.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"),
# to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense,
# and/or sell copies of the Software, and to permit persons to whom
# the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
# IN THE SOFTWARE.
#

module Ribosome

    # Class Block represents a rectangular area of text.
    class Block

        attr_accessor :text, :width

        def initialize(s)
            @text = []
            @width = 0
            return if s == nil

            # Split the string into individual lines.
			start = 0
			loop do
				i = s.index("\n", start) || s.size
				@text << (i == start ? "" : s[start..i - 1])
                @width = [@width, @text.last.size].max
				start = i + 1
				break if start > s.size
			end
        end

        # Weld the supplied block to the right side of this block.
        def add_right(block)

            # Merge the blocks while taking care to add whitespace
            # where they do not align properly.
            i = 0
            for l in block.text
                if(@text[i])
                    @text[i] += (" " * (@width - @text[i].size)) + l
                else
                    @text << (" " * @width) + l
                end
                i += 1
            end

            # Adjust the overall width of the block.
            @width += block.width
            
        end

        # Weld the supplied block to the bottom side of this block.
        def add_bottom(block)
            @text += block.text
            @width = [@width, block.width].max
        end

        # Trim the whitespace from the block.
        def trim()

            # Find the boundaries of the text.
            top = -1
            bottom = -1
            left = -1
            right = -1

            i = 0
            for l in @text
                if(!l.lstrip().empty?)
                    top = i if top == -1
                    bottom = i;
                    if (left == -1)
                        left = l.size() - l.lstrip().size()
                    else
                        left = [left, l.size() - l.lstrip().size()].min
                    end
                    if (right == -1)
                        right = l.rstrip().size()
                    else
                        right = [right, l.rstrip().size()].max
                    end
                end
                i += 1
            end

            # The case of block with no text whatsoever.
            if bottom == -1
                @text = []
                @width = 0
                return
            end

            # Strip off the top and bottom whitespace.
            @text = @text[top..bottom]

            # Strip off the whitespace on the left and on the right.
            for i in 0..@text.size() - 1
                @text[i] = @text[i].rstrip()[left..right]
                @text[i] = "" if @text[i] == nil
            end

            # Adjust the overall width of the block.
            @width = (@text.max {|x,y| x.size <=> y.size} || "").size

        end

        def write(out, tabsize)
            for l in @text

                # If required, replace the initial whitespace by tabs.
                if(tabsize > 0)
                    ws = l.size - l.lstrip.size
                    l = "\t" * (ws / tabsize) +
                        " " * (ws % tabsize) + l.lstrip
                end

                # Write an individual line to the output file.
                out.write(l)
                out.write("\n")
            end
        end

        # Returns offset of the last line in the block.
        def last_offset()
            return 0 if @text.empty?
            return @text.last.size - @text.last.lstrip.size
        end

    end

    # Size of a tab. If set to zero, tabs are not generated.
    @tabsize = 0

    # The output file, or, alternativly, stdout.
    @outisafile = false
    @out = $stdout

    # This is the ribosome call stack. At each level there is a list of
    # text blocks generated up to that point.
    @stack = [[]]

    # Redirects output to the specified file.
    def Ribosome.output(filename)
        close()
        @outisafile = true
        @out = File.open(filename, "w")
    end

    # Redirects output to the specified file.
    # New stuff is added to the existing content of the file.
    def Ribosome.append(filename)
        close()
        @outisafile = true
        @out = File.open(filename, "a")
    end

    # Redirects output to the stdout.
    def Ribosome.stdout()
        close()
        @outisafile = false
        @out = $stdout
    end

    # Sets the size of the tab.
    def Ribosome.tabsize(size)
        @tabsize = size
    end

    # Flush the data to the currently open file and close it.
    def Ribosome.close()
        for b in @stack.last
            b.write(@out, @tabsize)
        end
        @stack = [[]]
        @out.close() if @outisafile
    end

    # Adds one . line from the DNA file.
    def Ribosome.add(line, bind)

        # If there is no previous line, add one.
        if(@stack.last.empty?)
            @stack.last << Block.new("")
        end

        # In this block we will accumulate the expanded line.
        block = @stack.last.last

        # Traverse the line and convert it into a block.
        i = 0
        while true
            j = line.index(/[@&][1-9]?\{/, i)
            j = line.size if j == nil

            # Process constant block of text.
            if (i != j)
                block.add_right(Block.new(line[i..j - 1]))
            end

            break if line.size == j

            # Process an embedded expression.
            i = j
            j += 1
            level = 0
            if (line[j] >= ?1 && line[j] <= ?9)
                level = line[j].ord
                j += 1
            end

            # Find corresponding }.
            par = 0;
            while true
                if(line[j] == ?{)
                    par += 1
                elsif(line[j] == ?})
                    par -= 1
                end
                break if par == 0
                j += 1
                if j >= line.size
                    raise SyntaxError.new("Unmatched {")
                end
            end

            # Expression of higher indirection levels are simply brought
            # down by one level.
            if(level > 0)
                if line [i + 1] == ?1
                    block.add_right(Block.new("@" + line[i + 2..j]))
                else
                    line[i + 1] = (line [i + 1].ord - 1).chr
                    block.add_right(Block.new(line[i..j]))
                end
                i = j + 1
                next
            end

            # We are at the lowest level of embeddedness so we have to
            # evaluate the embedded expression straight away.
            expr = line[(level == 0 ? i + 2 : i + 3)..j - 1]
            @stack.push([])
            val = eval(expr, bind)
            top = @stack.pop()
            if(top.empty?)
                val = Block.new(val.to_s)
            else
                val = Block.new("")
                for b in top
                    val.add_bottom(b)
                end
            end
            val.trim if line[i] == ?@
            block.add_right(val)
            i = j + 1
        end
    end

    # Adds newline followed by one . line from the DNA file.
    def Ribosome.dot(line, bind)
        @stack.last << Block.new("")
        add(line, bind)
    end

    # Adds newline followed by leading whitespace copied from the previous line
    # and one line from the DNA file.
    def Ribosome.align(line, bind)
        if @stack.last.empty?
            n = 0
        else
            n = @stack.last.last.last_offset
        end
        @stack.last << Block.new("")
        add(" " * n, nil)
        add(line, bind)
    end

    #  Report an error that happened when executing RNA file.
    def Ribosome.rethrow(e, rnafile, linemap)
        i = 0
        for i in 0..e.backtrace.size - 1
            l = e.backtrace[i]
            if l.start_with?(rnafile + ":")
                stop = l.index(":", rnafile.size + 1) || l.size
                num = l[rnafile.size + 1..stop - 1].to_i
                for j in 0..linemap.size - 1
                    break if linemap[j][0] == nil || linemap[j][0] > num
                end
                j -= 1
                num = num - linemap[j][0] + linemap[j][2]
                l = "#{linemap[j][1]}:#{num}#{l[stop..-1]}"
                e.backtrace[i] = l
            end
        end
        raise e
    end

end

# Escape function for @
def at()
    return "@"
end

# Escape function for &
def amp()
    return "&"
end

# Escape function for /
def slash()
    return "/"
end

################################################################################
# The code that belongs to the ribosome project ends at this point of the      #
# RNA file and so does the associated license. What follows is the code        #
# generated from the DNA file.                                                 #
################################################################################

'

################################################################################
#  DNA helper functions.                                                       #
################################################################################

def usage()
    $stderr.write "usage: ribosome.rb [options] <dna-file> <args-passed-to-dna-script>\n"
    exit(1)
end

# Print out the error and terminate the generation.
def dnaerror(s)
    $stderr.write("#{$dnastack.last[1]}:#{$dnastack.last[2]} - #{s}\n")
    exit(1)
end

# Generate new line(s) into the RNA file.
def rnawrite(s)
    $linemap << [$rnaln, $dnastack.last[1], $dnastack.last[2]]
    $rna.write(s)
    $rnaln += s.count("\n")
end

################################################################################
#  Main function.                                                              #
################################################################################

# Parse the command line arguments.
if(ARGV.size() < 1 || ARGV[0] == "-h" || ARGV[0] == "--help")
    usage()
end
if ARGV[0] == "-v" || ARGV[0] == "--version"
    puts "ribosome code generator, version 1.17"
    exit(1)
end
if ARGV[0] == "--rna"
    if(ARGV.size() < 2)
        usage()
    end
    rnaopt = true
    dnafile = ARGV[1]
else
    rnaopt = false
    dnafile = ARGV[0]
end

# Given that we can 'require' other DNA files, we need to keep a stack of
# open DNA files. We also keep the name of the file and the line number to
# be able to report errors. We'll also keep track of the directory the DNA file
# is in to be able to correctly expand relative paths in /!include commands.
$dnastack = [[nil, "ribosome.rb", PROLOGUE_LINE + 1, Dir.pwd]]

if rnaopt
    $rna = $stdout
else
    # Create the RNA file.
    if(dnafile[-4..-1] == ".dna")
        $rnafile = dnafile[0..-5] + ".rna"
    else
        $rnafile = dnafile + ".rna"
    end
    $rna = File.open($rnafile, "w")
end
$rnaln = 1
$linemap = []

# Generate RNA prologue code.
rnawrite(PROLOGUE)
if (!rnaopt)
    rnawrite("begin\n\n")
end

# Process the DNA file.
dirname = File.expand_path(File.dirname(dnafile))
$dnastack.push [File.open(dnafile, "r"), dnafile, 0, dirname]
loop do

    # Get next line. Unwind the include stack as necessary.
    line = nil
    loop do
        line = $dnastack.last[0].gets()
        break if line != nil
        $dnastack.pop[0].close()
        break if $dnastack.size == 1
    end
    break if line == nil

    # We are counting lines so that we can report line numbers in errors.
    $dnastack.last[2] += 1

    # All Ruby lines are copied to the RNA file verbatim.
    if line.size == 0 || line[0] != ?\.
        rnawrite(line)
        next
    end

    # Removes dot from the beginning of the line and
    # trailing $ sign, if present.
    line = line[1..-2]
    line = line[0..-2] if line[-1] == ?$

    # Make sure there are no tabs in the line.
    if(line.index(?\t) != nil)
        dnaerror("tab found in the line, replace it by space")
    end

    # Find first two non-whitespace which can possibly form a command.
    firsttwo = line.lstrip[0..1]

    # /+ means that the line is appended to the previous line.
    if(firsttwo == "/+")
        rnawrite("Ribosome.add(#{line.lstrip[2..-1].inspect()}, binding)\n")
        next
    end

    # /= means that the line is aligned with the previous line.
    if(firsttwo == "/=")
        rnawrite("Ribosome.align(#{line.lstrip[2..-1].inspect()}, binding)\n")
        next
    end

    # /! means that a command follows.
    if(firsttwo == "/!")
        line =  line.lstrip[2..-1]
        match = /^[0-9A-Za-z_]+/.match(line)
        if(match == nil)
            dnaerror("/! should be followed by an identifier")
        end
        command = match[0]
        
        # A subset of commands is simply translated to corresponding
        # commands in the RNA file.
        if (["output", "append", "stdout", "tabsize"].include?(command))
            rnawrite("Ribosome.#{line}\n")
            next
        end

        # The argument string will be added at the end of each interation of
        # the following loop, except for the last one.
        if(command == "separate")
            def identity(x) x end
	        separator = eval("identity#{line[8..-1]}")
	        cname = "____separate_#{$rnaln}____"
	        rnawrite("#{cname} = true\n")
	        line = $dnastack.last[0].gets()
	        $dnastack.last[2] += 1
	        if(line == nil || line[0] == ?. ||
	              (!line.index('while') && !line.index('until') &&
	              !line.index('for') && !line.index('each') &&
	              !line.index('upto') && line.index('downto') &&
	              !line.index('times') && line.index('loop')))
	            dnaerror("'separate' command must be followed by a loop")
	        end
	        rnawrite(line)
	        rnawrite("if(#{cname})\n")
	        rnawrite("    #{cname} = false\n")
	        rnawrite("else\n")
	        rnawrite("    Ribosome.add(#{separator.inspect()}, binding)\n")
	        rnawrite("end\n")
	        next
        end

        # Open the file and put it on the top of the DNA stack. Relative paths
        # are expanded using the directory the parent DNA file resides in as
        # a starting point.
        if(command == "include")
            def identity(x) x end
	        filename = eval("identity#{line[7..-1]}")
            filename = File.expand_path(filename, $dnastack.last[3])
            dirname = File.dirname(filename)
            $dnastack.push([File.open(filename, "r"), filename, 0, dirname])
            next
        end

        dnaerror("unknown command '#{command}'")
    end

    # There's no command in the line. Process it in the standard way.
    rnawrite("Ribosome.dot(#{line.inspect()}, binding)\n")

end

# Generate RNA epilogue code.
$dnastack = [[nil, "ribosome", __LINE__ + 1]]
$rna.write("\n")
if !rnaopt
    $rna.write("rescue Exception =>e\n")
    $rna.write("    LINEMAP = [\n");
    last = nil
    for le in $linemap
        if last == nil || le[1] != last[1] || le[0] - last [0] != le[2] - last[2]
            $rna.write("        [#{le[0]}, #{le[1].inspect}, #{le[2]}],\n")
            last = le
        end
    end
    $rna.write("        [nil]\n")
    $rna.write("    ]\n");
    $rna.write("    Ribosome.rethrow(e, " + $rnafile.inspect + ", LINEMAP)\n")
    $rna.write("end\n")
    $rna.write("\n")
end
$rna.write("Ribosome.close()\n")
$rna.write("\n")

# Flush the RNA file.
$rna.close()

if !rnaopt

    # Execute the RNA file. Pass it any arguments not used by ribosome.
    result = system("ruby #{$rnafile} " + ARGV[1..-1].join(' '))

    # Delete the RNA file.
    File.delete($rnafile)

    exit result

end

