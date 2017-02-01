class WorkflowUtils
  class << self
    def construct_workflow(assignment)
      cycle = !(assignment.marking_tool_contexts.pluck(:depends_on).include? [])
      raise StandardError, 'All marking tools depend on another marking service! Please remove cycle' if cycle

      assignment.marking_tool_contexts.each do |mtc|
        tool = MarkingTool.find_by(id: mtc.marking_tool_id)
        raise StandardError, "Error with marking tool #{tool.name}. Marking services cannot depend on themselves" if mtc.depends_on.include? tool.uid

        uid = tool.uid.to_sym
        assignment.active_services[uid] = mtc.depends_on
      end
      assignment.save
    end

    def next_services_to_invoke(assignment, marking_tool = nil)
      to_invoke = []
      assignment.active_services.each do |tool, depends_array|
        if marking_tool
          depends_array.delete marking_tool.uid if depends_array.include? marking_tool.uid
        end
        to_invoke << tool.to_s if depends_array.empty?
        binding.pry
      end
      assignment.save
    end
  end
end
