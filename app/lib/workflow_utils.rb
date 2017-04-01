require 'set'

class WorkflowUtils
  class << self
    # Given an assignment with marking tool contexts
    # Constructs a workflow using a hash where each key is a marking service
    # and its value is an array of tools that it depends on, such that the tool
    # cannot run until every tool in the array has returned a mark
    # Based on a topolical sort
    # Runs in O(n) linear time where n is the number of marking tool contexts
    def construct_workflow(marking_tool_contexts)
      return {} if marking_tool_contexts.empty?

      # If each marking tool context depends on another, then there would be a cycle
      # in the workflow graph. Correct workflows in Nexus are defined as DAGs
      cycle = !(marking_tool_contexts.map(&:depends_on).include? [])
      raise StandardError, 'All marking tools depend on another marking service! Please remove cycle' if cycle

      active_services = {}
      marking_tool_contexts.each do |mtc|
        tool = MarkingTool.find_by(id: mtc.marking_tool_id)
        raise StandardError, "Error with marking tool #{tool.name}. Marking services cannot depend on themselves" if mtc.depends_on.include? tool.uid
        depends_on = Set.new MarkingTool.where(uid: mtc.depends_on).pluck(:uid)
        # Set a key in the hash to be the tool uid for the current mtc
        # Set the value to be the array of tools it depends on before it can run
        active_services[tool.uid] = depends_on
      end

      # Validate Workflow
      workflow = active_services.deep_dup
      valid = valid_workflow?(workflow)
      raise StandardError, 'Please remove the circular dependency' unless valid
      active_services
    end

    # Given a submission with an active service hash
    # Return an array with all the keys, coresponding to UIDs
    # such that their value in the hash is an empty array
    # Runs in O(n) time where n is the number of keys in the hash.
    def next_services_to_invoke(active_services)
      to_invoke = []
      active_services.each do |tool, depends_set|
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
    def trim_workflow!(active_services, marking_tool)
      if active_services.delete(marking_tool)
        active_services.each do |_, depends_set|
          depends_set.delete marking_tool if depends_set.include? marking_tool
        end
      end
      active_services
    end

    # Uses a breadth first search to traverse the rest of the workflow graph
    # Setting the mark for that tool to 0 as each node is visited.
    # Returns the nodes that were visited as a result of the simulation, not
    # including the root
    def fail_rest_of_workflow!(submission, marking_tool)
      # Only need to consider the remaining workflow.
      workflow = submission.active_services
      queue = []
      visited = Set.new # Ensure each node is only enqueued once

      # Add current nodes children to queue.
      workflow.each do |tool, depends_set|
        queue << tool if depends_set.include? marking_tool
      end
      until queue.empty?
        current_service = queue.shift # shift is equivalent to dequeue.
        marking_tool = MarkingTool.find_by!(uid: current_service)
        intermediate_mark = submission.intermediate_marks.find_by!(marking_tool_id: marking_tool.id)
        intermediate_mark.mark = 0
        intermediate_mark.save!
        visited.add(current_service)
        workflow.each do |tool, depends_set|
          queue << tool if depends_set.include?(current_service) && !visited.include?(tool)
        end
      end
      visited.delete marking_tool
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
