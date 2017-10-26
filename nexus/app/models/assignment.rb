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

  after_save :uat_save_hook
  before_destroy :uat_destroy_hook

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

    @generated_description = UATUtils.generate_description(self, for_user)

    @generated_description
  end

  # Start code for fake uat_parameters 'association'

  # Simulate the existence of uat_parameters as part of the assignment. These will, in fact, be picked up from the UAT instead
  class UATParameter
    def initialize(name, type, construct, is_new)
      @name = name
      @type = type
      @construct = construct
      @is_new = is_new
    end

    def name
      @name
    end

    def type
      @type
    end

    def construct
      @construct
    end

    def persisted?
      false
    end

    # Needed to fake this as an association for cocoon
    def new_record?
      @is_new
    end

    def marked_for_destruction?
      false
    end

    def _destroy
    end
  end

  def build_uat_parameter
    UATParameter.new('', 0, '', true)
  end

  def uat_parameters
    return [] unless (is_unique || new_record?)

    if (new_record?)
      Rails.logger.debug('Returning initial parameter set for assignment.')
      [UATParameter.new('name', 1, '', false)]
    else
      unless (@uat_attributes)
        # Get current parameters from UAT
        @uat_attributes = UATUtils.get_params_for(self)
          .map { | param | UATParameter.new(param[:name], param[:type], param[:construct], false) }
      end
      @uat_attributes
    end
  end

  # This just stores the values in this object. When save is invoked, these values will be sent to the UAT
  def uat_parameters_attributes=(attributes)
    Rails.logger.debug("Asked to set uat parameters for this assignment: #{attributes}.")
    @uat_attributes_changed = true
    @uat_attributes = attributes
        .map { | attr |  UATParameter.new(attr[1]['name'], attr[1]['type'].to_i, attr[1]['construct'], true) }
    Rails.logger.debug("Attributes kept are now: #{@uat_attributes}")
  end

  def uat_save_hook
    return unless @uat_attributes_changed
    if is_unique
      UATUtils.send_params_to_uat (self)
    else
      # TODO: Should probably check if it was registered with the UAT before
      UATUtils.remove_from_uat (self)
    end
    @uat_attributes_changed = false
  end

  def uat_destroy_hook
    if is_unique
      UATUtils.remove_from_uat (self)
    end
  end

# End code for fake uat_parameters 'association'


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
