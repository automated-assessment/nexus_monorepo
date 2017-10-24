class Assignment < ActiveRecord::Base
  belongs_to :course
  has_many :submissions, dependent: :destroy
  has_many :marking_tool_contexts
  has_many :marking_tools, through: :marking_tool_contexts
  has_many :deadline_extensions
  has_many :audit_items

  accepts_nested_attributes_for :marking_tool_contexts, reject_if: proc { |attributes| attributes[:marking_tool_id].blank? }

  serialize :active_services, Hash
  serialize :dataflow, Hash

  validates :title, presence: true
  validates :start, presence: true
  validates :deadline, presence: true
  validates :latedeadline, presence: true, if: :allow_late
  validates :allow_late, inclusion: [true, false]
  validates :feedback_only, inclusion: [true, false]
  validates :course, presence: true
  validate :valid_weightings

  validates_datetime :deadline, after: :start
  validates_datetime :latedeadline, after: :deadline, if: :allow_late

  default_scope { order(:start) }
  scope :started, -> { where('start < ?', Time.current).reorder(:deadline) }

  after_create do
    log("Assignment id #{id} (#{title}) created.")
  end

  after_update do
    log("Assignment id #{id} updated.")
  end

  def started?
    start.past?
  end

  def due_within?(options)
    deadline < DateTime.now.utc.advance(options)
  end

  def late_capping?
    late_cap != 100.0
  end

  def decorator_class
    return 'danger' if deadline.past?
    return 'warning' if due_within?(days: 7)
    ''
  end

  def configurable_tools?
    marking_tools.configurable.any?
  end

  def highest_mark_for(u = current_user)
    return 'n/a' if submissions.where(user: u).where.not(mark: nil).empty?
    "#{submissions.where(user: u).where.not(mark: nil).reorder(mark: :desc).first.mark}%"
  end

  def displayable_description(for_user)
    return description unless is_unique

    return @generated_description if @generated_description

    Rails.logger.info 'Assignment is unique, requesting generation for description'

    uri = URI.parse("#{Rails.configuration.uat_host}:#{Rails.configuration.uat_port}/desc_gen")

    Net::HTTP.start(uri.host, uri.port) do |http|
      req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

      req.body = {
        aid: id,
        studentid: for_user.id,
        is_unique: true,
        description_string: description
      }.to_json

      res = http.request(req)
      Rails.logger.info res.body
      if res.code =~ /2../
        Rails.logger.info 'Success generating description for unique assignment'
        @generated_description = (JSON.parse res.body)['generated'][0]
      else
        Rails.logger.info 'Error generating description for unique assignment'
        @generated_description = 'ERROR: Error on generation of description. Get in contact with your lecturer for further details.'
      end
    end

    @generated_description
  end

  def log(body, level = 'info')
    AuditItem.create!(assignment: self,
                      body: body,
                      level: level)
  end

  private

  def valid_weightings
    return if marking_tool_contexts.empty?
    sum = 0
    marking_tool_contexts.each do |c|
      sum += c.weight
    end
    errors.add(:marking_tool_contexts, 'Weights do not add up to 100%') if sum != 100
  end
end
