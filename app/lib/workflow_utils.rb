class WorkflowUtils
  class << self
    # Given an `assignment` with some `Marking Tool Contexts`
    # It creates a workflow using `Active Services`
    # Returns an error message describing any invalid paramters
    # Returns nil otherwise.
    def construct_workflow(assignment)
      tool_ids = assignment.marking_tool_contexts.pluck(:marking_tool_id)
      assignment_tools = MarkingTool.where(id: tool_ids).pluck(:uid)

      # Create ActiveService nodes for each marking tool context
      # allows the adding of marking services to assignments in any order
      assignment.marking_tool_contexts.each do |mtc|
        as = ActiveService.new
        as.assignment = assignment
        mt = MarkingTool.find(mtc.marking_tool_id)
        as.marking_tool_uid = mt.uid
        as.condition = mtc.condition
        as.save!
      end

      # Handle dependencies between the marking tool contexts
      assignment.marking_tool_contexts.each do |mtc|
        mt = MarkingTool.find(mtc.marking_tool_id)
        as = ActiveService.find_by(assignment_id: assignment.id, marking_tool_uid: mt.uid)
        unless mtc.depends_on.empty?
          # Check if active service depends on itself
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

    def get_first_services_to_invoke(assignment)
      active_services = ActiveService.where(assignment_id: assignment.id)
      active_services.to_a.select { |as| as.parents.empty? }
    end

    def next_services_to_invoke(active_service)
      active_service.children.to_a
    end
  end
end
