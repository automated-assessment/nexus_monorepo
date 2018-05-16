require File.expand_path('../boot', __FILE__)

require 'rails'
# Pick the frameworks you want:
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'action_view/railtie'
# require 'sprockets/railtie'
# require 'rails/test_unit/railtie'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Fyp
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    # Do not swallow errors in after_commit/after_rollback callbacks.
    config.active_record.raise_in_transactional_callbacks = true

    # Make sure the asset pipeline is disabled
    config.assets.enabled = false

    # Stop generators from creating assets (js/css)
    config.generators do |g|
      g.assets false
    end

    config.exceptions_app = routes

    # Custom config params
    config.ghe_oauth_id = ENV['NEXUS_GHE_OAUTH_ID']
    config.ghe_oauth_secret = ENV['NEXUS_GHE_OAUTH_SECRET']
    config.github_com_oauth_id = ENV['NEXUS_GITHUB_COM_OAUTH_ID']
    config.github_com_oauth_secret = ENV['NEXUS_GITHUB_COM_OAUTH_SECRET']
    config.ghe_user = ENV['NEXUS_GITHUB_USER']
    config.ghe_password = ENV['NEXUS_GITHUB_TOKEN']
    config.ghe_org = ENV['NEXUS_GITHUB_ORG'] || 'ppa-dev'
    config.uat_host = ENV['NEXUS_UAT_HOST'] || 'unique-assignment-tool'
    config.uat_port = ENV['NEXUS_UAT_PORT'] || 3009
  end
end
