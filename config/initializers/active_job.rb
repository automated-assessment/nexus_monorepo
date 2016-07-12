# Configuring queue manager
#config.active_job.queue_adapter = :sneakers
ActiveJob::Base.queue_adapter = :sneakers

opts = {
  amqp: "amqp://#{Rails.configuration.rabbit_mq_host}:#{Rails.configuration.rabbit_mq_port}",
  #vhost: 'guest',
  exchange: 'sneakers',
  exchange_type: :direct
}

Sneakers.configure(opts)
