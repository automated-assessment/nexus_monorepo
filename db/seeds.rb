# Mock Users
User.create(email: 'student@kcl.ac.uk',
            password: '12345678',
            password_confirmation: '12345678',
            first_name: 'John',
            last_name: 'Student',
            level: 0,
            student_id: '1262100')

User.create(email: 'teacher@teacher.com',
            password: '12345678',
            password_confirmation: '12345678',
            first_name: 'Professor',
            last_name: 'McTeacherson',
            level: 1,
            student_id: '')

User.create(email: 'admin@admin.com',
            password: '12345678',
            password_confirmation: '12345678',
            first_name: 'Joe',
            last_name: 'Administrator',
            level: 2,
            student_id: '')
