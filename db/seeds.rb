if ENV['DOCKER']
  puts 'Invoked by Docker'
  MarkingTool.create(name: 'Java Compilation',
                     description: 'Java Compilation',
                     url: 'http://javac-tool:5000/mark',
                     uid: 'javac',
                     requires_config: false)

  MarkingTool.create(name: 'RNG Tool',
                     description: 'Random number generator',
                     url: 'http://rng-tool:3000/mark',
                     uid: 'rng',
                     requires_config: false)

  MarkingTool.create(name: 'Config Tool',
                     description: 'Sample Configuration Tool',
                     url: 'http://config-tool:3000/mark',
                     uid: 'conf',
                     requires_config: true,
                     config_url: 'http://config-tool:3000/static/config.html?aid=%{aid}')

  MarkingTool.create(name: 'IO Tool',
                     description: 'IO Tool',
                     url: 'http://io-tool:3000/mark',
                     uid: 'iotool',
                     requires_config: true,
                     config_url: 'http://io-tool:3000/#/static/config.html?aid=%{aid}')
end

if Rails.env.eql? 'development'
  u = User.create(email: 'teacher@teacher.com',
                  password: '12345678',
                  password_confirmation: '12345678',
                  name: 'Professor Tesla (k0000000)',
                  admin: true)

  Course.create(title: 'Course',
                description: 'A Course',
                teacher_id: u.id)

  # Assumes foo set in access token env field for each marking service
  a = AccessToken.create(access_token: '',
                         description: 'Sample access token')

  a.access_token = 'foo'
  a.save!

  unless ENV['DOCKER']
    puts 'Invoked locally'
    MarkingTool.create(name: 'Java Compilation',
                       description: 'Java Compilation',
                       url: 'http://localhost:3003/mark',
                       uid: 'javac',
                       requires_config: false)

    MarkingTool.create(name: 'RNG Tool',
                       description: 'Random number generator',
                       url: 'http://localhost:3001/mark',
                       uid: 'rng',
                       requires_config: false)

    MarkingTool.create(name: 'Config Tool',
                       description: 'Sample Configuration Tool',
                       url: 'http://localhost:3002/mark',
                       uid: 'conf',
                       requires_config: true,
                       config_url: 'http://localhost:3002/static/config.html?aid=%{aid}')

    MarkingTool.create(name: 'IO Tool',
                       description: 'IO Tool',
                       url: 'http://localhost:3004/mark',
                       uid: 'iotool',
                       requires_config: true,
                       config_url: 'http://localhost:3004/#/static/config.html?aid=%{aid}')
  end
end
