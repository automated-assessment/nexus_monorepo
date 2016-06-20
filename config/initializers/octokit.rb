Octokit.configure do |c|
  c.api_endpoint = 'https://github.kcl.ac.uk/api/v3/'
  c.login = Rails.configuration.ghe_user
  c.password = Rails.configuration.ghe_password
end
