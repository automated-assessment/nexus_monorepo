module UserHelper
  # Returns the Gravatar for the given user.
  def gravatar_for(user, size = 80)
    gravatar_id = Digest::MD5.hexdigest(user.email)
    gravatar_url = "https://secure.gravatar.com/avatar/#{gravatar_id}?s=#{size}"
    image_tag(gravatar_url, alt: 'gravatar', class: 'gravatar')
  end

  def user_icon_for(user)
    case user.level
    when 'student'
      tag('i', class: ['fa', 'fa-graduation-cap'])
    when 'staff'
      tag('i', class: ['fa', 'fa-user-plus'])
    when 'admin'
      tag('i', class: ['fa', 'fa-user-secret'])
    else
      ''
    end
  end
end
