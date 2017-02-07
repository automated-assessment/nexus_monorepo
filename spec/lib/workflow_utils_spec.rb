require 'rails_helper'

RSpec.describe WorkflowUtils do
  let(:a) { create(:assignment) }
  let(:mt_1) { create(:marking_tool) }
  let(:mt_2) { create(:marking_tool) }
  let(:mt_3) { create(:marking_tool) }
  let(:mt_4) { create(:marking_tool) }

  let(:mtc_1) { MarkingToolContext.new }
  let(:mtc_2) { MarkingToolContext.new }
  let(:mtc_3) { MarkingToolContext.new }
  let(:mtc_4) { MarkingToolContext.new }

  describe '#construct_workflow' do
    context 'with 0 marking services assigned' do
      it 'returns straight away with no changes' do
        described_class.construct_workflow(a)
        expect(a.active_services).to eq({})
      end
    end

    context 'with a single service workflow' do
      context 'with the tool dependent on itself' do
        it 'raises a StandardError with a message' do
          mtc_1.assignment_id = a.id
          mtc_1.marking_tool_id = mt_1.id
          mtc_1.weight = 50
          mtc_1.condition = 0
          mtc_1.depends_on = []

          mtc_1.depends_on << mtc_1
          mtc_1.save!
          expect { described_class.construct_workflow(a) }.to raise_error(StandardError)
        end
      end
      context 'with the tool not dependent on anything' do
        it 'creates a hash structure with a single tool' do
          result = {
            mt_1.uid => []
          }

          mtc_1.assignment_id = a.id
          mtc_1.marking_tool_id = mt_1.id
          mtc_1.weight = 25
          mtc_1.condition = 0
          mtc_1.depends_on = []
          mtc_1.save!

          described_class.construct_workflow(a)
          expect(a.active_services).to eq result
        end
      end
    end
    context 'with a multi tool workflow' do
      context 'with a sequential structure' do
        it 'creates the appropriate hash structure' do
          result = {
            mt_1.uid => [],
            mt_2.uid => [mt_1.uid],
            mt_3.uid => [mt_2.uid],
            mt_4.uid => [mt_3.uid]
          }

          mtc_1.assignment_id = a.id
          mtc_1.marking_tool_id = mt_1.id
          mtc_1.weight = 25
          mtc_1.condition = 0
          mtc_1.depends_on = []

          mtc_2.assignment_id = a.id
          mtc_2.marking_tool_id = mt_2.id
          mtc_2.weight = 25
          mtc_2.condition = 0
          mtc_2.depends_on = []

          mtc_3.assignment_id = a.id
          mtc_3.marking_tool_id = mt_3.id
          mtc_3.weight = 25
          mtc_3.condition = 0
          mtc_3.depends_on = []

          mtc_4.assignment_id = a.id
          mtc_4.marking_tool_id = mt_4.id
          mtc_4.weight = 25
          mtc_4.condition = 0
          mtc_4.depends_on = []

          mtc_4.depends_on << mtc_3
          mtc_3.depends_on << mtc_2
          mtc_2.depends_on << mtc_1
          mtc_1.save!
          mtc_2.save!
          mtc_3.save!
          mtc_4.save!

          described_class.construct_workflow(a)
          expect(a.active_services).to eq result
        end
      end
      context 'with a parallel structure' do
        context 'with a cycle in marking tool contexts' do
          it 'raises a StandardError' do
            mtc_1.assignment_id = a.id
            mtc_1.marking_tool_id = mt_1.id
            mtc_1.weight = 50
            mtc_1.condition = 0
            mtc_1.depends_on = []

            mtc_2.assignment_id = a.id
            mtc_2.marking_tool_id = mt_2.id
            mtc_2.weight = 50
            mtc_2.condition = 0
            mtc_2.depends_on = []

            mtc_1.depends_on << mtc_2
            mtc_2.depends_on << mtc_1
            mtc_1.save!
            mtc_2.save!
            expect { described_class.construct_workflow(a) }.to raise_error(StandardError)
          end
        end
      end
      context 'with an aggregation structure' do
        context 'with a cycle in marking tool contexts' do
          it 'raises a StandardError' do
            mtc_1.assignment_id = a.id
            mtc_1.marking_tool_id = mt_1.id
            mtc_1.weight = 50
            mtc_1.condition = 0
            mtc_1.depends_on = []

            mtc_2.assignment_id = a.id
            mtc_2.marking_tool_id = mt_2.id
            mtc_2.weight = 50
            mtc_2.condition = 0
            mtc_2.depends_on = []

            mtc_1.depends_on << mtc_2
            mtc_2.depends_on << mtc_1
            mtc_1.save!
            mtc_2.save!
            expect { described_class.construct_workflow(a) }.to raise_error(StandardError)
          end
        end
      end
    end
  end

  describe '#reset_workflow' do
    it 'resets submission workflow back to definition set in its assignment' do
    end
  end

  describe '#next_services_to_invoke' do
    describe 'with marking tools left to invoke' do
      it 'returns a non empty array of tools eligible for invocation' do
      end
    end
    describe 'with no more marking tools to invoke' do
      it 'returns an empty array' do
      end
    end
  end

  describe '#trim_workflow!' do
    describe 'when the marking service is apart of the workflow' do
    end
    describe 'when the marking tool is not apart of the workflow' do
    end
  end
end
