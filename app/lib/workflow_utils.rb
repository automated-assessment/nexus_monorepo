class WorkflowUtils
  class << self
    def construct_workflow(assignment)
      cycle = !(assignment.marking_tool_contexts.pluck(:depends_on).include? [])
      raise StandardError, 'All marking tools depend on another marking service! Please remove cycle' if cycle

      assignment.marking_tool_contexts.each do |mtc|
        tool = MarkingTool.find_by(id: mtc.marking_tool_id)
        raise StandardError, "Error with marking tool #{tool.name}. Marking services cannot depend on themselves" if mtc.depends_on.include? tool.uid

        uid = tool.uid
        assignment.active_services[uid] = mtc.depends_on
      end
      assignment.save
    end

    def reset_workflow(submission)
      submission.active_services = submission.assignment.active_services
      submission.save!
    end

    def next_services_to_invoke(submission)
      to_invoke = []
      submission.active_services.each do |tool, depends_array|
        to_invoke << tool.to_s if depends_array.empty?
      end
      to_invoke
    end

    def trim_workflow!(submission, marking_tool)
      submission.active_services.delete(marking_tool) if marking_tool
      submission.active_services.each do |_, depends_array|
        depends_array.delete marking_tool if depends_array.include? marking_tool
      end
      submission.save!
    end
  end
end
