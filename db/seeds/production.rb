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

  MarkingTool.create(name: 'IO Tool',
                     description: 'IO Tool',
                     url: 'http://io-tool:3001/mark',
                     uid: 'iotool',
                     input: 'java',
                     output: nil,
                     requires_config: true,
                     config_url: 'http://io-tool:3004/#/static/config.html?aid=%{aid}',
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

  MarkingTool.create(name: 'IO Tool',
                     description: 'IO Tool',
                     url: 'http://localhost:3001/mark',
                     uid: 'iotool',
                     input: 'java',
                     output: nil,
                     requires_config: true,
                     config_url: 'http://localhost:3001/#config?aid=%{aid}',
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
