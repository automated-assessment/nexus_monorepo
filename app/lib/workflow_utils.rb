require 'set'
require 'uri'

class WorkflowUtils
  class << self
    # Given marking tool contexts and service dependency information
    # Constructs a workflow using a hash where each key is a marking service
    # and its value is a set of tools that it depends on, such that the tool
    # cannot run until every tool in the set has returned a mark
    def construct_workflow(marking_tool_contexts, dependencies)
      workflow = {}
      marking_tool_contexts.each do |key, value|
        marking_tool = MarkingTool.find(value[:marking_tool_id])
        workflow[marking_tool.uid] = Set.new
        next unless dependencies
        workflow[marking_tool.uid] = Set.new dependencies[key] if dependencies[key]
        if workflow[marking_tool.uid].include? marking_tool.uid
          raise StandardError, "Error with marking tool #{marking_tool.name}. Marking services cannot depend on themselves"
        end
      end

      # Validate Workflow
      copy_of_workflow = workflow.deep_dup
      valid = valid_workflow?(copy_of_workflow)
      raise StandardError, 'Please remove the circular dependency between services' unless valid
      workflow
    end

    # Given a submission with an active service hash
    # Return an array with all the keys, coresponding to UIDs
    # such that their value in the hash is an empty array
    # Runs in O(n) time where n is the number of keys in the hash.
    def next_services_to_invoke(workflow)
      to_invoke = []
      return to_invoke unless workflow
      workflow.each do |tool, depends_set|
        to_invoke << tool if depends_set.empty?
      end
      to_invoke
    end

    # Given a submission and a marking tool that has just returned a mark
    # Remove the reporting tool from the submissions workflow
    # Traverse the workflow to remove it as a dependent for each tool that depends on it
    # Those keys in the hash where the value is now an empty array are
    # now eligible for invocation
    # Runs in O(n) where n is the number of keys in the hash
    def trim_workflow!(workflow, service)
      if workflow.delete(service)
        workflow.each do |_, depends_set|
          depends_set.delete service if depends_set.include? service
        end
      end
      workflow
    end

    # Uses a breadth first search to traverse the rest of the workflow graph
    # At each node, it executes any block that is given.
    # Returns the nodes that were visited as a result of the simulation, not
    # including the root
    def simulate_workflow(workflow, service)
      # Only need to consider the remaining workflow.
      queue = []
      visited = Set.new # Ensure each node is only enqueued once
      return visited unless workflow && service
      # Add current nodes children to queue.
      workflow.each do |tool, depends_set|
        queue << tool if depends_set.include? service
      end
      until queue.empty?
        current_service = queue.shift # shift is equivalent to dequeue.
        yield current_service if block_given?
        visited.add(current_service)
        workflow.each do |tool, depends_set|
          queue << tool if depends_set.include?(current_service) && !visited.include?(tool)
        end
      end
      visited.delete service
    end

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
        tools.each do |tool|
          next unless tool.access_token
          tool_entry = {}
          uri = URI(tool.url)
          uri.path = '/data'
          tool_entry['url'] = uri.to_s
          tool_entry['auth_token'] = tool.access_token
          tools_that_require_files << tool_entry.to_json
          handled_tools.add tool.url
        end
        tools_that_require_files.each do |tool|
          tool_hash = JSON.parse(tool)
          handled_tools.add tool_hash['url']
        end
        # Add tool to handled tools since dataflow only goes in one direction
        handled_tools.add marking_tool.url
        dataflow[marking_tool.uid] = tools_that_require_files
        # Can return once all tools have been dealt with.
        return dataflow if handled_tools.size == marking_tool_contexts.size
      end
      dataflow
    end

    private

    # Given a hash defining a workflow
    # Return true if it is a valid DAG
    # Return false otherwise
    def valid_workflow?(workflow)
      return true if workflow.empty?
      parentless = next_services_to_invoke(workflow)
      return false if parentless.empty?
      parentless.each do |p|
        workflow = trim_workflow!(workflow, p)
      end
      valid_workflow?(workflow)
    end
  end
end
