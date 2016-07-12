require File.expand_path('../config/application', __FILE__)
#require 'sneakers/tasks'
require 'sneakers/runner'

Rails.application.load_tasks

# Code taken from https://gist.github.com/stevegraham/b60cc852c010c72760e7
task :environment

namespace :sneakers do
  desc "Start processing jobs with all workers"
  task :work  => :environment do
    silence_warnings do
      Rails.application.eager_load! unless Rails.application.config.eager_load
    end

    workers = ActiveJob::Base.subclasses.map do |klass|
      klass.const_set("Wrapper", Class.new(ActiveJob::QueueAdapters::SneakersAdapter::JobWrapper) do
        from_queue klass.queue_name
      end)
    end

    Sneakers::Runner.new(workers).run
  end
end
