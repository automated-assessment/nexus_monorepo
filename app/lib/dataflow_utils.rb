require 'set'
require 'uri'

class DataflowUtils
  class << self
    # Given an assignment with marking tool contexts
    # Constructs the dataflow definition for the whole assignment
    # Returns a hash where each key is a marking service that outputs some file
    # and each value is an array of marking services that take that file as input
    # in the context of the assignment
    def construct_dataflow(marking_tool_contexts)
      return {} if marking_tool_contexts.empty?
      dataflow = {}
      handled_files = Set.new # Prevents more than one tool passing on one file type
      handled_tools = Set.new
      marking_tool_contexts.each do |context|
        marking_tool = context.marking_tool
        next unless marking_tool.output # Prevent a nil entry into hash

        # Move on if file type has already been handled by another tool
        next if handled_files.include? marking_tool.output
        handled_files.add marking_tool.output
        # Get array of marking service urls such that the tool takes in the given
        # file type as input
        tools = MarkingTool.find(marking_tool_contexts.map(&:marking_tool_id)).select do |tool|
          (tool.input.eql? marking_tool.output) && !(tool.uid.eql? marking_tool.uid)
        end
        tools_that_require_files = []
        tools.map(&:url).each do |tool|
          uri = URI(tool)
          uri.path = '/data'
          tools_that_require_files << uri.to_s
          handled_tools.add tool
        end
        tools_that_require_files.each do |tool|
          handled_tools.add tool
        end
        # Add tool to handled tools since dataflow only goes in one direction
        handled_tools.add marking_tool.url
        dataflow[marking_tool.uid] = tools_that_require_files unless tools_that_require_files.empty?
        # Can return once all tools have been dealt with.
        return dataflow if handled_tools.size == marking_tool_contexts.size
      end
      dataflow
    end
  end
end
