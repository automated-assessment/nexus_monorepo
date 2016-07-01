# Required so that timestamps retrieved from the database can be sorted precisely
# e.g. to ensure audit items on submission are displayed in the correct order
Time::DATE_FORMATS[:db] = '%Y-%m-%d %H:%M:%S.%3N' unless Rails.env.production?
