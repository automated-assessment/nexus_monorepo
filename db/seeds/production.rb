MarkingTool.create(name: 'Nexus',
                   description: 'The central management component',
                   url: 'n/a',
                   uid: 'nexus',
                   input: '',
                   output: '',
                   requires_config: false,
                   access_token: '')

User.create(email: 'teacher@teacher.com',
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
                     url: 'http://io-tool:3000/mark',
                     uid: 'iotool',
                     input: 'java',
                     output: nil,
                     requires_config: true,
                     config_url: 'http://io-tool:3000/#/static/config.html?aid=%{aid}',
                     access_token: 'bar')
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
                     url: 'http://localhost:3004/mark',
                     uid: 'iotool',
                     input: 'java',
                     output: nil,
                     requires_config: true,
                     config_url: 'http://localhost:3004/#/static/config.html?aid=%{aid}',
                     access_token: 'bar')
end
