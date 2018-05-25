require 'set'
require 'uri'

class WorkflowUtils
  RUNNING = '__RUNNING__'
  
  class << self
    # Given marking tool contexts and service dependency information
    # Constructs a workflow using a hash where each key is a marking service
    # and its value is a set of tools that it depends on, such that the tool
    # cannot run until every tool in the set has returned a mark
    def construct_workflow(marking_tool_contexts, dependencies)
      return {} unless marking_tool_contexts && !marking_tool_contexts.empty?
      workflow = {} # Actual workflow definition.
      marking_tool_contexts.each do |key, value|
        marking_tool = MarkingTool.find(value['marking_tool_id'])
        # Create new entry for the tool in the workflow
        workflow[marking_tool.uid] = Set.new

        # Move on unless there are dependencies to process
        next unless dependencies && !dependencies.empty?

        # Assign the dependent marking services to the entry just made in the
        # workflow.
        workflow[marking_tool.uid] = Set.new dependencies[key] if dependencies[key]
        if workflow[marking_tool.uid].include? marking_tool.uid
          raise StandardError, "Error with marking tool #{marking_tool.name}. Marking services cannot depend on themselves"
        end
      end

      ### MARK: Validate Workflow
      # Ruby is pass-by-value so make copy of workflow to be mutated.
      copy_of_workflow = workflow.deep_dup
      valid = valid_workflow?(copy_of_workflow)
      raise StandardError, 'Please remove the circular dependency between services' unless valid
      workflow
    end

    # Given a submission with an active service hash
    # Return an array with all the keys, coresponding to UIDs
    # such that their value in the hash is an empty array
    # Empty array = the tool is ready to be invoked
    def next_services_to_invoke(workflow)
      to_invoke = []
      # If, for some reason, workflow is nil, return empty
      return to_invoke unless workflow
      # If workflow is not nil but empty, it will still return empty
      workflow.each do |tool, depends_set|
        # Else, add all tools with empty dependency arrays
        to_invoke << tool if depends_set.empty?
      end
      to_invoke
    end

    # Given a submission and a marking tool that has just returned a mark
    # Remove the reporting tool from the submissions workflow
    # Traverse the workflow to remove it as a dependent for each tool that depends on it
    # Those keys in the hash where the value is now an empty array are
    # now eligible for invocation
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
        # Execute the block given at each node
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
    def construct_dataflow(workflow)
      return {} if workflow.empty?
      workflow_copy = workflow.deep_dup
      dataflow = {}
      handled_files = {} # Prevents more than one tool passing on one file type
      until workflow_copy.empty?
        tools = next_services_to_invoke(workflow_copy)
        marking_tools = MarkingTool.where(uid: tools)
        marking_tools.each do |tool|
          trim_workflow!(workflow_copy, tool.uid)
          next unless tool.output
          unless handled_files[tool.output]
            handled_files[tool.output] = tool.uid
          end
        end
      end

      visited = Set.new
      workflow_copy = workflow.deep_dup
      until workflow_copy.empty?
        tools = next_services_to_invoke(workflow_copy)
        marking_tools = MarkingTool.where(uid: tools)
        marking_tools.each do |tool|
          trim_workflow!(workflow_copy, tool.uid)
          next unless tool.input
          next unless handled_files[tool.input] && visited.include?(handled_files[tool.input])
          unless dataflow[handled_files[tool.input]]
            dataflow[handled_files[tool.input]] = []
          end
          dataflow[handled_files[tool.input]] << tool_data_entry(tool)
        end
        visited.merge(tools)
      end
      dataflow
    end

    private

    def tool_data_entry(tool)
      tool_entry = {}
      uri = URI(tool.url)
      uri.path = '/data'
      tool_entry['url'] = uri.to_s
      tool_entry['auth_token'] = tool.access_token
      tool_entry
    end

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
