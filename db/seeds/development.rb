MarkingTool.create(name: 'Nexus',
                   description: 'The central management component',
                   url: 'n/a',
                   uid: 'nexus',
                   input: '',
                   output: '',
                   requires_config: false,
                   access_token: '')

u = User.create(email: 'teacher@teacher.com',
                password: '12345678',
                password_confirmation: '12345678',
                name: 'Professor Tesla (k0000000)',
                admin: true)

Course.create(title: 'Course',
              description: 'A Course',
              teacher_id: u.id)

# Assumes foo set in access token env field for each marking service
a = AccessToken.create(access_token: '', description: 'Sample access token')

a.access_token = 'foo'
a.save!

if ENV['DOCKER']
  puts 'Invoked by Docker'
  MarkingTool.create(name: 'Java Compilation',
                     description: 'Java Compilation',
                     url: 'http://javac-tool:5000/mark',
                     uid: 'javac',
                     input: 'java',
                     output: 'class',
                     requires_config: false,
                     access_token: 'bar')

  MarkingTool.create(name: 'RNG Tool',
                     description: 'Random number generator',
                     url: 'http://rng-tool:3000/mark',
                     uid: 'rng',
                     input: 'java',
                     output: 'java',
                     requires_config: false,
                     access_token: 'bar')

### MARK: Configurable Tools
# The domain of the web hook url and the config url are different
# You must use the name of the docker service and the port exposed in the services
# Dockerfile for the web hook url as it is used
# by nexus which is part of the docker swarm network

# You must use localhost and the port assigned to the docker container since
# the browser does not have direct access to the Docker swarm network.

  MarkingTool.create(name: 'Config Tool',
                     description: 'Sample Configuration Tool',
                     url: 'http://config-tool:3000/mark',
                     uid: 'conf',
                     input: nil,
                     output: nil,
                     requires_config: true,
                     config_url: 'http://localhost:3002/static/config.html?aid=%{aid}',
                     access_token: 'bar')

  MarkingTool.create(name: 'IO Tool',
                     description: 'IO Tool',
                     url: 'http://io-tool:3000/mark',
                     uid: 'iotool',
                     input: 'java',
                     output: nil,
                     requires_config: true,
                     config_url: 'http://localhost:3004/#/static/config.html?aid=%{aid}',
                     access_token: 'bar')

  MarkingTool.create(name: 'Peer Feedback',
                     description: 'Peer Feedback Tool',
                     url: 'http://peer-feedback:3050/mark',
                     input: nil,
                     output: nil,
                     requires_config: true,
                     config_url: "http://localhost:3005/#!/frame/configuration
                                  ?aid=%{aid}&token=#{a.access_token}&email=#{u.email}")
else
  puts 'Invoked locally'
  MarkingTool.create(name: 'Java Compilation',
                     description: 'Java Compilation',
                     url: 'http://localhost:5000/mark',
                     uid: 'javac',
                     input: 'java',
                     output: 'class',
                     requires_config: false,
                     access_token: 'bar')

  MarkingTool.create(name: 'RNG Tool',
                     description: 'Random number generator',
                     url: 'http://localhost:5001/mark',
                     uid: 'rng',
                     input: 'java',
                     output: 'java',
                     requires_config: false,
                     access_token: 'bar')

  MarkingTool.create(name: 'Config Tool',
                     description: 'Sample Configuration Tool',
                     url: 'http://localhost:3002/mark',
                     uid: 'conf',
                     input: nil,
                     output: nil,
                     requires_config: true,
                     config_url: 'http://localhost:3002/static/config.html?aid=%{aid}',
                     access_token: 'bar')

  MarkingTool.create(name: 'IO Tool',
                     description: 'IO Tool',
                     url: 'http://localhost:3004/mark',
                     uid: 'iotool',
                     input: 'java',
                     output: nil,
                     requires_config: true,
                     config_url: 'http://localhost:3004/#/static/config.html?aid=%{aid}',
                     access_token: 'bar')

  MarkingTool.create(name: 'Peer Feedback',
                     description: 'Peer Feedback Tool',
                     url: 'http://localhost:3005/mark',
                     input: nil,
                     output: nil,
                     requires_config: true,
                     config_url: "http://localhost:3005/#!/frame/configuration
                                  ?aid=%{aid}&token=#{a.access_token}&email=#{u.email}")
end
