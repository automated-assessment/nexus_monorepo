module SubmissionHelper
  def display_final_mark(submission)
    if submission.pending?
      # This may actually be an error, so need to work our way through the various error states
      if submission.extraction_error?
        content_tag(:span, 'Extraction Error', class: 'label label-danger')
      elsif !submission.git_success?
        content_tag(:span, 'GHE Push Error', class: 'label label-danger')
      elsif submission.failed?
        content_tag(:span, 'Marking Tool Error', class: 'label label-danger')
      else
        content_tag(:span, 'Pending', class: 'label label-default')
      end
    else
      s = "#{submission.mark}%"
      content_tag(:span) do
        case submission.mark
        when 0..40 then concat(content_tag(:strong, s, class: 'text-danger'))
        when 41..69 then concat(content_tag(:strong, s, class: 'text-warning'))
        else concat(content_tag(:strong, s, class: 'text-success'))
        end
        concat(content_tag(:span, ' '))
        # TODO: This next line is really only here to be backward compatible with when we were incorrectly reporting a mark of 0 against extraction errors
        concat(content_tag(:span, 'Extraction Error', class: 'label label-danger')) if submission.extraction_error?
        concat(content_tag(:span, 'Capped', class: 'label label-default')) if submission.late? && submission.assignment.late_capping?
      end
    end
  end

  def display_intermediate_mark(submission, marking_tool)
    im = IntermediateMark.find_by(submission_id: submission.id, marking_tool_id: marking_tool.id)
    return content_tag(:small, 'n/a') if im.nil? # this marking tool must have a weight of 0%
    if im.pending?
      content_tag(:span, 'Pending', class: 'label label-default')
    else
      content_tag(:span) do
        concat(content_tag(:strong, "#{im.mark}%"))
      end
    end
  end
end
