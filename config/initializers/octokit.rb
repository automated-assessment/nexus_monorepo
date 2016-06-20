Octokit.configure do |c|
  c.api_endpoint = 'https://github.kcl.ac.uk/api/v3/'
  c.login = ENV['NEXUS_GITHUB_USER']
  c.password = ENV['NEXUS_GITHUB_TOKEN']
end
