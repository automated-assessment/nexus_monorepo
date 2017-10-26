class UATUtils
  class << self

    # Invoke UAT to generate the description for the given assignment
    def generate_description(assignment, for_user)
      uri = uat_url('desc_gen')

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
      uri = uat_url('param_update')
      Net::HTTP.start(uri.host, uri.port) do |http|
        req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

        req.body = {
          assignment: assignment.id,
          parameters: assignment.uat_parameters.map { | p | {type: p.type, name: p.name, construct: p.construct} }
        }.to_json

        res = http.request(req)
        if res.code =~ /2../
          Rails.logger.info 'Successfully sent parameters to unique assignment tool'
        else
          Rails.logger.info 'Error sending parameters to unique assignment tool'
        end
      end
    end

    def get_params_for (assignment)
      uri = uat_url('get_params')
      Net::HTTP.start(uri.host, uri.port) do |http|
        req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

        req.body = {
          assignment: assignment.id
        }.to_json

        res = http.request(req)
        Rails.logger.debug res.body
        if res.code =~ /2../
          Rails.logger.info 'Successfully obtained parameters from unique assignment tool'
          return (JSON.parse res.body)['parameters'].map { | p |
              {type: reverse_type_lookup(p['type']), name: p['name'], construct: p['construct']}
            }
        else
          Rails.logger.info 'Error getting parameters from unique assignment tool'
          return []
        end
      end
    end

    def remove_from_uat (assignment)
      Rails.logger.debug("Requesting removal of assignment #{assignment} from UAT.")

      uri = uat_url('remove_assignment')
      Net::HTTP.start(uri.host, uri.port) do |http|
        req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

        req.body = {
          assignment: assignment.id
        }.to_json

        res = http.request(req)
        if res.code =~ /2../
          Rails.logger.info 'Successfully removed assignment from UAT.'
        else
          Rails.logger.info 'Error removing assignment from UAT.'
        end
      end
    end

    def all_uat_param_types
      [
        {id: 1, name: 'int'},
        {id: 2, name: 'float'},
        {id: 3, name: 'double'},
        {id: 4, name: 'string'},
        {id: 5, name: 'boolean'}
      ]
    end

    private

    def uat_url (endpoint)
      URI.parse("http://#{Rails.configuration.uat_host}:#{Rails.configuration.uat_port}/#{endpoint}")
    end

    def reverse_type_lookup(type_name)
      all_uat_param_types.select { | pt | pt[:name] == type_name}.map { | pt | pt[:id] }
    end
  end
end
