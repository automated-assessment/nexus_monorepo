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
    config.ghe_user = ENV['NEXUS_GITHUB_USER']
    config.ghe_password = ENV['NEXUS_GITHUB_TOKEN']
    config.ghe_org = ENV['NEXUS_GITHUB_ORG'] || 'ppa-dev'

    config.rabbit_mq_host = ENV['RABBIT_MQ_HOST'] || 'localhost'
    config.rabbit_mq_port = ENV['RABBIT_MQ_PORT'] || 5672
    config.rabbit_mq_qname = ENV['RABBIT_MQ_QNAME'] || "nexus.submissions_to_tools"
    config.number_consumers = ENV['RABBIT_MQ_NUM_CONSUMERS'] || 1

    config.max_submission_retries = ENV['MAX_SUBMISSION_RETRIES'] || 3

    # Configuring queue manager
    config.active_job.queue_adapter = :sneakers

    opts = {
      amqp: "amqp://#{config.rabbit_mq_host}:#{config.rabbit_mq_port}",
      #vhost: 'guest',
      exchange: 'sneakers',
      exchange_type: :direct
    }

    Sneakers.configure(opts)
  end
end
