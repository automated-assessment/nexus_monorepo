class ValidationController < ApplicationController
  include ApplicationHelper
  
  require 'net/http'
  require 'json'

  def assignment_schema
    assignment_schema = {
      '$schema' => 'http://json-schema.org/draft-07/schema#',
      'type' => 'object',
      'properties' => {
        'title' => { 'type' => 'string' },
        'description' => { 'type' => 'string' },
        'start' => {
          'type' => 'string',
          'format' => 'date-time'
        },
        'deadline' => {
          'type' => 'string',
          'format' => 'date-time'
        },
        'allow_late' => { 'type' => 'boolean' },
        'late_cap' => {
          'type' => 'integer',
          'minimum' => 0,
          'maximum' => 100
        },
        'allow_zip' => { 'type' => 'boolean' },
        'allow_git' => { 'type' => 'boolean' },
        'allow_ide' => { 'type' => 'boolean' },
        'max_attempts' => { 'type' => 'integer' },
        'latedeadline' => {
          'type' => 'string',
          'format' => 'date-time'
        },
        'feedback_only' => { 'type' => 'boolean' },
        'is_unique' => { 'type' => 'boolean' },
        'uat_parameters' => {
          'type' => 'array',
          'items' => {
            'type' => 'object',
            'properties' => {
              'name' => { 'type' => 'string' },
              'type' => {
                'type' => 'string',
                'enum' => [ 'int', 'float', 'double', 'string', 'boolean' ]
              },
              'construction_constraints' => { 'type' => 'string' }
            },
            'required' => [ 'name', 'type', 'construction_constraints' ]
          }
        }
      },
      'required' => [
        'description',
        'start',
        'deadline',
        'allow_late',
        'late_cap',
        'allow_zip',
        'allow_git',
        'allow_ide',
        'max_attempts',
        'latedeadline',
        'feedback_only',
        'is_unique'
      ],
      'additionalProperties' => false,
      'if': { 'properties': { 'is_unique': { 'const': true } } },
      'then': { 'required': [ 'uat_parameters' ] }
    }

    render json: assignment_schema.to_json, status: 200
  end

  # Converts a parameter in a grader config schema to an equivalent JSON schema object
  def schema_property_to_json_schema(property)
    if property['type'] == 'git'
      return {
        'type' => 'object',
        'properties' => {
          'repository' => {
            'anyOf' => [
              # Both of them are strings, but it is important
              # to specify this in the schema for whoever is
              # reading this comment. Value 'this' has a
              # special meaning - we are referring to 'this'
              # repository, where the assignment and grader
              # config is defined.
              { 'const' => 'this' },
              { 'type' => 'string' }
            ]
          },
          'branch' => { 'type' => 'string' },
          'sha' => {
            'anyOf' => [
              # Similar to repository - both are strings, but
              # 'latest' has a special meaning - the sha of
              # the latest commit in the repository.
              { 'const' => 'latest' },
              { 'type' => 'string' }
            ]    
          }
        },
        'required' => [ 'repository', 'branch', 'sha' ],
        'additionalProperties' => false
      }
    elsif property['type'] == 'int'
      # At the end we also remove nil values, aka the values that are undefined
      # in the grader config schema
      return {
        'type' => 'integer',
        'minimum' => property['min'],
        'maximum' => property['max'],
        'multipleOf' => property['step'],
        'default' => property['initial']
      }.delete_if{ |k,v| v.nil? }
    elsif property['type'] == 'string'
      return {
        'type' => 'string',
        'default' => property['initial']
      }
    end
    
    raise "Invalid grader config parameter type: #{property['type']}"
  end

  # Return the 'configuration' property for a grader in grader-config
  def config_schema_to_json_schema(config_schema)
    if config_schema['parameters'] == 0
      #  Grader is non-configurable
      return { 'type' => 'null' }
    else
      # Grader is configurable

      properties_param = {}
      properties = []
      config_schema['parameters'].each do |parameter_name, parameter_spec|
        # Generate the 'properties' property for a JSON schema object for
        # each schema property received from a GET grader config schema
        # endpoint
        properties_param[parameter_name] = schema_property_to_json_schema(parameter_spec);
        
        # Store each property in an array as a string. This will be used
        # for the 'required' property for a JSON schema object.
        properties.push(parameter_name);
      end
    end

    return {
      'type' => 'object',
      'properties' => properties_param,
      'required' => properties,
      'additionalProperties' => false
    }
  end

  # Retrieve grader config schema from a GET config_schema endpoint
  def retrieve_config_schema(grader_url)
    # Some graders are not build on top of abstract grader and therefore may
    # not have the 'grader_schema' endpoint, where this action could retrieve
    # the schema. We consider two such cases:
    #
    # 1) Where the URL in 'graderUrls' is nil.
    # 2) Where the URL in 'graderUrls' is defined, but calling the HTTP API returns status 404.
    #
    # In both cases, we will assume that the
    # grader DOES actually exist (because it was given as an input to the
    # action), but we will assume that it is non-configurable, and therefore
    # return a schema which a non-configurable grader would return.
    non_configurable_grader_schema = {
      'parameters' => 0
    }

    # Case 1
    if grader_url == nil
      return non_configurable_grader_schema
    end

    response = nil
    begin
      uri = URI(grader_url)
      response = Net::HTTP.get_response(uri)
    rescue StandardError => e
      raise "Invalid request to server #{grader_url}: #{e.message}"
      return
    end
    
    # Case 2
    if response.code == '404'
      return non_configurable_grader_schema
    end

    # value is a bad function name. Here is what is does:
    # Raises an HTTP error if the response is not 2xx (success).
    begin
      response.value
    rescue StandardError => e
      raise "Invalid response from server #{grader_url}: #{e.message}"
      return
    end

    response_json = nil
    begin
      response_json = JSON.parse(response.body)
    rescue StandardError => e
      raise "Invalid JSON from server #{grader_url}: #{e.message}"
      return
    end

    return response_json
  end

  # Generates a JSON schema conditional statement for a configuration based on the name of the grader used
  def config_json_schema_to_conditional(grader_name, configuration_schema)
    return {
      'if' => { 'properties' => { 'name' => { 'const' => grader_name } } },
      'then' => {
        'properties' => { 'configuration' => configuration_schema }
      }
    }
  end

  # Generates an 'allOf' array of JSON schema conditional statements to change
  # the 'configuration' property based on name of the grader
  def generate_config_json_schema_conditionals(grader_endpoints)
    config_json_schemas = {}
    grader_endpoints.each do |grader_name, grader_url|
      config_schema = retrieve_config_schema(grader_url)
      json_schema = config_schema_to_json_schema(config_schema)
      config_json_schemas[grader_name] = json_schema
    end
    
    config_json_schema_conditionals = [];
    config_json_schemas.each do |grader_name, grader_json_schema|
      json_schema_conditional = config_json_schema_to_conditional(grader_name, grader_json_schema);
      config_json_schema_conditionals.push(json_schema_conditional);
    end

    return config_json_schema_conditionals
  end

  def generate_full_config_json_schema(grader_urls, configs_conditionals)
    return {
      '$schema' => 'http://json-schema.org/draft-07/schema#',
      'type' => 'array',
      'items' => {
        'type' => 'object',
        'properties' => {
          'name' => { 'type' => 'string', 'enum' => grader_urls.keys },
          'weight' => { 'type' => 'integer' },
          'condition' => { 'type' => 'integer' },
          'context' => { 'type' => 'string' },
          'depends-on' => {
            'type' => 'array',
            'items' => { 'type' => 'string' }
          },
          'configuration' => {
            'oneOf' => [
              { 'type' => 'object' },
              { 'type' => 'null' }
            ]
          }
        },
        # I think that this 'required' is only necessary either here or in
        # 'configJsonSchemaToConditional', but since I've now made it so that it
        # would be same and not depend on the conditionals, I'm moving it here
        'required' => [ 'name', 'weight', 'condition', 'configuration' ],
        'additionalProperties' => false,
        'allOf' => configs_conditionals
      }
    }
  end

  def grader_config_schema
    grader_urls = {
      'javac' => 'http://javac-tool:5000/config_schema',
      'rng' => 'http://rng-tool:3000/config_schema',
      'conf' => 'http://config-tool:3000/config_schema',
      'iotool' => 'http://io-grader:5000/config_schema',
      'junit' => 'http://junit-grader:5000/config_schema'
      # 'cppiograder' => 'http://localhost:3008/config_schema',
      # 'cppcompilation' => 'http://localhost:3007/config_schema',
      # 'cppunit' => 'http://localhost:3015/config_schema'
    }

    # Generate grader config JSON schema
    grader_config_schema = nil
    begin
      config_json_schema_conditionals = generate_config_json_schema_conditionals(grader_urls)
      grader_config_schema = generate_full_config_json_schema(grader_urls, config_json_schema_conditionals);
    rescue StandardError => e
      render plain: "Error generating grader config JSON schema: #{e.message}", status: 500
      return
    end

    render json: grader_config_schema.to_json, status: 200
  end
end
