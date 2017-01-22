class WorkflowUtils
  class << self
    # Given an `assignment` with some `Marking Tool Contexts`
    # It creates a workflow using `Active Services`
    # Returns an error message describing any invalid paramters
    # Returns nil otherwise.
    def construct_workflow(assignment)
      tool_ids = assignment.marking_tool_contexts.pluck(:marking_tool_id)
      assignment_tools = MarkingTool.where(id: tool_ids).pluck(:uid)

      assignment.marking_tool_contexts.each do |mtc|
        as = ActiveService.new
        as.assignment = assignment
        mt = MarkingTool.find(mtc.marking_tool_id)
        as.marking_tool_uid = mt.uid
        as.condition = mtc.condition

        unless mtc.depends_on.empty?
          # Check that active service depends on itself
          if mtc.depends_on.include? mt.uid
            return "#{mt.name} cannot depend on itself!"
          end

          # Check each item in depends on is actually a part of the assignment
          unless (assignment_tools & mtc.depends_on).eql? mtc.depends_on
            return "One or more tools that #{mt.name} depends on have not been added to the assignment"
          end

          as.parents = ActiveService.where(assignment_id: assignment.id, marking_tool_uid: mtc.depends_on)
        end
        as.save!
      end
      nil
    end

    def next_services_to_invoke(submission)
      return [] unless submission.valid?
      submission.active_services.select { |as| as.parents.empty? }
    end

    def trim_workflow!(submission, marking_tool)
    end
  end
end
