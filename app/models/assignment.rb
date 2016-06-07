class Assignment < ActiveRecord::Base
  belongs_to :course
  has_many :marking_tool_contexts
  has_many :marking_tools, through: :marking_tool_contexts

  accepts_nested_attributes_for :marking_tool_contexts, reject_if: proc { |attributes| attributes[:marking_tool_id].blank? }

  validates :title, presence: true
  validates :start, presence: true
  validates :deadline, presence: true
  validates :allow_late, inclusion: [true, false]
  validates :course, presence: true

  validate :valid_weightings

  validates_datetime :deadline, after: :start

  default_scope { order(:start) }
  scope :current, -> { where('start < ?', Time.current).reorder(:deadline) }
  scope :upcoming, -> { where('start > ?', Time.current) }

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
