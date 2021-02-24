class ValidationController < ApplicationController
  include ApplicationHelper

  skip_before_action :verify_authenticity_token, only: [:test_assignment]

  def test_assignment
    assignment = params[:validation]

    assignment_schema = {
      "$schema" => "http://json-schema.org/draft-04/schema#",
      "title" => "Assignment",
      "description" => "An assignment",
      "type" => "object",
      "properties" => {
        "title" => {
          "description" => "Title",
          "type" => "string"
        },
        "description" => {
          "description" => "Description",
          "type" => "string"
        },
        "start" => {
          "description" => "Start date",
          "type" => "string",
          "format" => "date-time"
        },
        "deadline" => {
          "description" => "Deadline",
          "type" => "string",
          "format" => "date-time"
        },
        "allow_late" => {
          "description" => "Allow late submissions",
          "type" => "boolean"
        },
        "late_cap" => {
          "description" => "Late grade cap (%)",
          "type" => "integer",
          "minimum" => 0,
          "maximum" => 100,
          "default" => 40
        },
        "allow_zip" => {
          "description" => "Allow ZIP uploads",
          "type" => "boolean",
          "default" => true
        },
        "allow_git" => {
          "description" => "Allow git repository URL + commit SHA submissions",
          "type" => "boolean",
          "default" => true
        },
        "allow_ide" => {
          "description" => "Allow in-browser IDE submissions",
          "type" => "boolean",
          "default" => true
        },
        "max_attempts" => {
          "description" => "Maximum attempts",
          "type" => "integer"
        },
        "latedeadline" => {
          "description" => "Deadline for late submissions",
          "type" => "string",
          "format" => "date-time"
        },
        "feedback_only" => {
          "description" => "Provide feedback only",
          "type" => "boolean",
          "default" => false
        },
        "is_unique" => {
          "description" => "Is the assignment unique?",
          "type" => "boolean",
          "default" => false
        }
      },
      # All properties are required. Even though the schema provides default
      # values, they are only used for metadata, no different than the
      # description property. If the property is missing, it will NOT be
      # instantiated with the default value.
      # We could provide the ':insert_defaults => true' option to the
      # validator, but I don't.
      "required" => [
        "description",
        "start",
        "deadline",
        "allow_late",
        "late_cap",
        "allow_zip",
        "allow_git",
        "allow_ide",
        "max_attempts",
        "latedeadline",
        "feedback_only",
        "is_unique"
      ],
      "additionalProperties" => false
    }

    is_fully_valid_assignment = JSON::Validator.fully_validate(assignment_schema, assignment, :strict => true)
    is_valid_assignment = is_fully_valid_assignment.empty?

    render json: {
      response: {
        isValid: is_valid_assignment,
        errors: is_fully_valid_assignment
      }
    }.to_json, status: 200
  end
end
