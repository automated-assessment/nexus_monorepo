class UATUtils
  class << self

    # Invoke UAT to generate the description for the given assignment
    def generate_description(assignment, for_user)
      uri = URI.parse("http://#{Rails.configuration.uat_host}:#{Rails.configuration.uat_port}/desc_gen")

      Net::HTTP.start(uri.host, uri.port) do |http|
        req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

        req.body = {
          aid: assignment.id,
          studentid: for_user.id,
          is_unique: true,
          description_string: assignment.description
        }.to_json

        res = http.request(req)
        Rails.logger.info res.body
        if res.code =~ /2../
          Rails.logger.info 'Success generating description for unique assignment'
          return (JSON.parse res.body)['generated'][0]
        else
          Rails.logger.info 'Error generating description for unique assignment'
          return 'ERROR: Error on generation of description. Get in contact with your lecturer for further details.'
        end
      end
    end

    def send_params_to_uat (assignment)
      # FIXME: Clean up and combine into a single call to UAT
      uri = URI.parse("http://#{Rails.configuration.uat_host}:#{Rails.configuration.uat_port}/param_upload_start")
      Net::HTTP.start(uri.host, uri.port) do |http|
        req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/x-www-form-urlencoded')

        param_string = assignment.uat_parameters.map { | p | "#{p.name}:#{p.type}:#{p.construct}"}.join('|')
        req.body = "parameter_string=#{param_string}"

        res = http.request(req)
        Rails.logger.info res.body
        if res.code =~ /2../
          Rails.logger.info 'Successfully sent parameters to unique assignment tool'
        else
          Rails.logger.info 'Error sending parameters to unique assignment tool'
        end
      end

      uri = URI.parse("http://#{Rails.configuration.uat_host}:#{Rails.configuration.uat_port}/param_upload_finish")
      Net::HTTP.start(uri.host, uri.port) do |http|
        req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

        req.body = {
          aid: assignment.id
        }.to_json

        res = http.request(req)
      end
    end

    def remove_from_uat (assignment)
      # TODO: Implement
    end
  end
end
