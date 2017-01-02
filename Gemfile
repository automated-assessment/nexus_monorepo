source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.2.4'
# Use sqlite3 as the database for Active Record
gem 'sqlite3'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0', group: :doc
# Use Unicorn as the app server
gem 'unicorn-rails'
# Devise for users/auth
gem 'devise', '3.5.2'
# Datetime validations
gem 'validates_timeliness', '~> 4.0'
# Handling of ZIP archives
gem 'rubyzip', '>= 1.0.0'
# Async/Background tasks
gem 'daemons'
# Schema validations
gem 'json-schema'
# Nested forms with jQuery
gem 'cocoon'
# Fake data generation
gem 'factory_girl_rails'
gem 'faker'
# Omniauth thru GitHub
gem 'omniauth-github'
# Git interaction
gem 'git'
gem 'octokit', '~> 4.0'
# Markdown rendering
gem 'redcarpet'

gem 'closure_tree'

group :production do
  # postgres adapter
  gem 'pg'
end

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug'
  # Rspec unit testing
  gem 'rspec-rails', '~> 3.0'
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> in views
  gem 'web-console', '~> 2.0'

  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'

  # Better debugging!
  gem 'pry-rails'
  gem 'pry-byebug'

  # Colorized console output
  gem 'colorize'
end

group :test do
  gem 'nyan-cat-formatter'

  # for linting on CircleCI
  gem 'rubocop'
  gem 'rubocop-rspec'

  # CircleCI metadata collection
  gem 'rspec_junit_formatter', '0.2.2'
end

#gem 'bunny'
#gem 'sneakers', '2.3.5'
gem 'sneakers'
