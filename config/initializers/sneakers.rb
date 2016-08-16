Rails.configuration.rabbit_mq_user = ENV['RABBIT_MQ_USER'] || 'guest'
Rails.configuration.rabbit_mq_pwd = ENV['RABBIT_MQ_PWD'] || 'guest'
Rails.configuration.rabbit_mq_host = ENV['RABBIT_MQ_HOST'] || 'localhost'
Rails.configuration.rabbit_mq_port = ENV['RABBIT_MQ_PORT'] || 5672
Rails.configuration.rabbit_mq_qname = ENV['RABBIT_MQ_QNAME'] || "nexus.submissions_to_tools"

puts ::Rails.root.to_s
config_file = File.read(::Rails.root.to_s + '/config/sneakers.yml')
config = YAML.load(config_file)[::Rails.env]
  .symbolize_keys
  .merge(amqp: "amqp://#{Rails.configuration.rabbit_mq_user}:#{Rails.configuration.rabbit_mq_pwd}@#{Rails.configuration.rabbit_mq_host}:#{Rails.configuration.rabbit_mq_port}")
Sneakers.configure(config)

Sneakers.logger.level = Logger::INFO
