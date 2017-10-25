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
      uri = URI.parse("http://#{Rails.configuration.uat_host}:#{Rails.configuration.uat_port}/param_update")
      Net::HTTP.start(uri.host, uri.port) do |http|
        req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

        req.body = {
          assignment: assignment.id,
          parameters: assignment.uat_parameters.map { | p | {type: p.type, name: p.name, construct: p.construct} }
        }.to_json
        Rails.logger.debug("Request body is #{req.body}");

        res = http.request(req)
        Rails.logger.info res.body
        if res.code =~ /2../
          Rails.logger.info 'Successfully sent parameters to unique assignment tool'
        else
          Rails.logger.info 'Error sending parameters to unique assignment tool'
        end
      end
    end

    def remove_from_uat (assignment)
      # TODO: Implement
    end
  end
end
