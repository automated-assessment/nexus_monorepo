module ApplicationHelper
  def error_url(code)
    "#{ENV['RAILS_RELATIVE_URL_ROOT']}/#{code}"
  end

  def authenticate_admin!
    if is_admin?
      return true
    else
      redirect_to(error_url '401')
      return false
    end
  end

  def is_admin?
    current_user && current_user.admin?
  end

  def is_user? (user)
    current_user && (current_user.id == user.id)
  end

  def distance_from_now_string(datetime)
    s = distance_of_time_in_words_to_now(datetime)
    s << ' ago' if datetime.past?
    s
  end

  def strftime_uk(datetime)
    datetime.strftime('%A, %d %b %Y %H:%M').concat(' (UTC)')
  end

  def pretty_datetime(datetime)
    content_tag('span', distance_from_now_string(datetime), 'data-toggle': 'tooltip', title: strftime_uk(datetime))
  end

  def verify_access_token_header
    token = request.headers['HTTP_NEXUS_ACCESS_TOKEN']
    return false if token.nil?
    AccessToken.find_by(access_token: token).present?
  end

  def all_marking_tools
    MarkingTool.where.not(uid: 'nexus')
  end

  def render_unauthorized_json
    render json: { response: 'Unauthorized' }.to_json,
           status: 401
  end

  def icon(name)
    content_tag('i', '', class: "fa fa-#{name}")
  end

  def boolean_icon(b)
    if b
      content_tag 'p', class: 'text-success' do
        content_tag('i', '', class: 'fa fa-check')
      end
    else
      content_tag 'p', class: 'text-danger' do
        content_tag('i', '', class: 'fa fa-times')
      end
    end
  end

  def markdown(text)
    options = {
      filter_html: true,
      hard_wrap: true,
      link_attributes: { rel: 'nofollow', target: '_blank' }
    }

    extensions = {
      autolink: true,
      superscript: true,
      disable_indented_code_blocks: true,
      fenced_code_blocks: true,
      space_after_headers: true
    }

    renderer = Redcarpet::Render::HTML.new(options)
    @markdown ||= Redcarpet::Markdown.new(renderer, extensions)

    @markdown.render(text).html_safe
  end
end
