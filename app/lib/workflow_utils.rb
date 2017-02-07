class WorkflowUtils
  class << self
    # Given an assignment with marking tool contexts
    # Constructs a workflow using a hash where each key is a marking service
    # and its value is an array of tools that it depends on, such that the tool
    # cannot run until every tool in the array has returned a mark
    # Based on a topolical sort
    # Runs in O(n) linear time where n is the number of marking tool contexts
    def construct_workflow(assignment)
      return if assignment.marking_tool_contexts.empty?
      # If each marking tool context depends on another, then there would be a cycle
      # in the workflow graph. Correct workflows in Nexus are defined as DAGs
      cycle = !(assignment.marking_tool_contexts.pluck(:depends_on).include? [])
      raise StandardError, 'All marking tools depend on another marking service! Please remove cycle' if cycle

      assignment.marking_tool_contexts.each do |mtc|
        tool = MarkingTool.find_by(id: mtc.marking_tool_id)
        raise StandardError, "Error with marking tool #{tool.name}. Marking services cannot depend on themselves" if mtc.depends_on.include? tool.uid
        tool_ids = mtc.depends_on.map(&:marking_tool_id)
        depends_on = MarkingTool.where(id: tool_ids).pluck(:uid)

        # Set a key in the hash to be the tool uid for the current mtc
        # Set the value to be the array of tools it depends on before it can run
        assignment.active_services[tool.uid] = depends_on
      end
      assignment.save
    end

    # Used when a remark is required.
    # Set the workflow for the submission back to what it is defined in its
    # assignment
    def reset_workflow(submission)
      submission.active_services = submission.assignment.active_services
      submission.save!
    end

    # Given a submission with an active service hash
    # Return an array with all the keys, coresponding to UIDs
    # such that their value in the hash is an empty array
    # Runs in O(n) time where n is the number of keys in the hash.
    def next_services_to_invoke(submission)
      to_invoke = []
      submission.active_services.each do |tool, depends_array|
        to_invoke << tool.to_s if depends_array.empty?
      end
      to_invoke
    end

    # Given a submission and a marking tool that has just returned a mark
    # Remove the reporting tool from the submissions workflow
    # Traverse the workflow to remove it as a dependent for each tool that depends on it
    # Those keys in the hash where the value is now an empty array are
    # now eligible for invocation
    # Runs in O(nm) where n is the number of keys in the hash
    # and m is the number of marking tools assigned to the assignment
    def trim_workflow!(submission, marking_tool)
      submission.active_services.delete(marking_tool) if marking_tool
      submission.active_services.each do |_, depends_array|
        depends_array.delete marking_tool if depends_array.include? marking_tool
      end
      submission.save!
    end
  end
end
