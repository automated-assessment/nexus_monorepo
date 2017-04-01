require 'rails_helper'

RSpec.describe WorkflowUtils do
  let(:mt_1) { create(:marking_tool) }
  let(:mt_2) { create(:marking_tool) }
  let(:mt_3) { create(:marking_tool) }
  let(:mt_4) { create(:marking_tool) }
  let(:mt_5) { create(:marking_tool) }

  let(:mtc_1) { MarkingToolContext.new }
  let(:mtc_2) { MarkingToolContext.new }
  let(:mtc_3) { MarkingToolContext.new }
  let(:mtc_4) { MarkingToolContext.new }

  before(:each) do
    MarkingTool.delete_all
    MarkingToolContext.delete_all
    mtc_1.marking_tool = mt_1
    mtc_1.weight = 25
    mtc_1.condition = 0
    mtc_1.depends_on = []

    mtc_2.marking_tool = mt_2
    mtc_2.weight = 25
    mtc_2.condition = 0
    mtc_2.depends_on = []

    mtc_3.marking_tool = mt_3
    mtc_3.weight = 25
    mtc_3.condition = 0
    mtc_3.depends_on = []

    mtc_4.marking_tool = mt_4
    mtc_4.weight = 25
    mtc_4.condition = 0
    mtc_4.depends_on = []
  end

  describe '#construct_workflow' do
    context 'with 0 marking services assigned' do
      it 'returns straight away with no changes' do
        actual = described_class.construct_workflow({})
        expect(actual).to eq({})
      end
    end

    context 'with a single service workflow' do
      context 'with the tool dependent on itself' do
        it 'raises a StandardError with a message' do
          mtc_1.depends_on << mtc_1
          mtc_1.save!
          active_services = [mtc_1]
          expect { described_class.construct_workflow(active_services) }.to raise_error(StandardError)
        end
      end
    end

    context 'with the tool not dependent on anything' do
      it 'creates a hash structure with a single tool' do
        expected = {
          mt_1.uid => Set.new
        }

        active_services = [mtc_1]
        actual = described_class.construct_workflow(active_services)
        expect(actual).to eq expected
      end
    end

    context 'with a multi tool workflow' do
      context 'with a sequential structure' do
        it 'creates the appropriate hash structure' do
          expected = {
            mt_1.uid => Set.new,
            mt_2.uid => Set.new([mt_1.uid]),
            mt_3.uid => Set.new([mt_2.uid]),
            mt_4.uid => Set.new([mt_3.uid])
          }

          mtc_2.depends_on << mt_1.uid
          mtc_3.depends_on << mt_2.uid
          mtc_4.depends_on << mt_3.uid
          mtc_1.save!
          mtc_2.save!
          mtc_3.save!
          mtc_4.save!

          active_services = [mtc_1, mtc_2, mtc_3, mtc_4]

          actual = described_class.construct_workflow(active_services)
          expect(actual).to eq expected
        end
      end

      context 'with a parallel structure' do
        context 'with a cycle in marking tool contexts' do
          it 'raises a StandardError' do
            mtc_2.depends_on << mt_1.uid
            mtc_2.depends_on << mt_4.uid
            mtc_3.depends_on << mt_2.uid
            mtc_4.depends_on << mt_3.uid

            mtc_1.save!
            mtc_2.save!
            mtc_3.save!
            mtc_4.save!

            active_services = [mtc_1, mtc_2, mtc_3, mtc_4]
            expect { described_class.construct_workflow(active_services) }.to raise_error(StandardError)
          end
        end

        context 'with no cycle in the marking tool contexts' do
          it 'creates the appropriate hash structure' do
            expected = {
              mt_1.uid => Set.new,
              mt_2.uid => Set.new([mt_1.uid]),
              mt_3.uid => Set.new,
              mt_4.uid => Set.new([mt_3.uid])
            }

            mtc_2.depends_on << mt_1.uid
            mtc_4.depends_on << mt_3.uid

            mtc_1.save!
            mtc_2.save!
            mtc_3.save!
            mtc_4.save!

            active_services = [mtc_1, mtc_2, mtc_3, mtc_4]
            actual = described_class.construct_workflow(active_services)
            expect(actual).to eq expected
          end
        end
      end

      context 'with an aggregation structure' do
        context 'with a cycle in marking tool contexts' do
          it 'raises a StandardError' do
            mtc_2.depends_on << mt_3.uid
            mtc_3.depends_on << mt_1.uid
            mtc_3.depends_on << mt_2.uid
            mtc_4.depends_on << mt_3.uid

            mtc_1.save!
            mtc_2.save!
            mtc_3.save!
            mtc_4.save!

            active_services = [mtc_1, mtc_2, mtc_3, mtc_4]
            expect { described_class.construct_workflow(active_services) }.to raise_error(StandardError)
          end
        end
        context 'without a cycle in marking tool contexts' do
          it 'creates the appropriate hash structure' do
            expected = {
              mt_1.uid => Set.new([mt_2.uid]),
              mt_2.uid => Set.new,
              mt_3.uid => Set.new([mt_2.uid, mt_1.uid]),
              mt_4.uid => Set.new([mt_3.uid])
            }

            mtc_1.depends_on << mt_2.uid
            mtc_3.depends_on << mt_2.uid
            mtc_3.depends_on << mt_1.uid
            mtc_4.depends_on << mt_3.uid

            mtc_1.save!
            mtc_2.save!
            mtc_3.save!
            mtc_4.save!

            active_services = [mtc_1, mtc_2, mtc_3, mtc_4]
            actual = described_class.construct_workflow(active_services)
            expect(actual).to eq expected
          end
        end
      end
    end
  end

  describe '#next_services_to_invoke' do
    context 'with marking tools left to invoke' do
      it 'returns a non empty array of tools eligible for invocation' do
        expected = [mt_1.uid, mt_3.uid]
        mtc_2.depends_on << mt_1.uid
        mtc_4.depends_on << mt_3.uid

        mtc_1.save!
        mtc_2.save!
        mtc_3.save!
        mtc_4.save!

        active_services = described_class.construct_workflow([mtc_1, mtc_2, mtc_3, mtc_4])

        actual = described_class.next_services_to_invoke(active_services)
        expect(actual).to eq expected
      end
    end
    context 'with no more marking tools to invoke' do
      it 'returns an empty array' do
        expected = []
        actual = described_class.next_services_to_invoke([])
        expect(expected).to eq actual
      end
    end
  end

  describe '#trim_workflow!' do
    describe 'when the marking service is apart of the workflow' do
      it 'removes the reporting tool from workflow and updates the depends on sets' do
        expected = {
          mt_1.uid => Set.new,
          mt_3.uid => Set.new([mt_1.uid]),
          mt_4.uid => Set.new([mt_3.uid])
        }

        mtc_1.depends_on << mt_2.uid
        mtc_3.depends_on << mt_1.uid
        mtc_3.depends_on << mt_2.uid
        mtc_4.depends_on << mt_3.uid

        mtc_1.save!
        mtc_2.save!
        mtc_3.save!
        mtc_4.save!

        active_services = [mtc_1, mtc_2, mtc_3, mtc_4]
        workflow = described_class.construct_workflow(active_services)

        actual = described_class.trim_workflow!(workflow, mt_2.uid)
        expect(actual).to eq expected
      end
    end
    context 'when the marking tool is not apart of the workflow' do
      it 'returns the workflow as it is, unchanged' do
        expected = {
          mt_1.uid => Set.new([mt_2.uid]),
          mt_2.uid => Set.new,
          mt_3.uid => Set.new([mt_1.uid, mt_2.uid]),
          mt_4.uid => Set.new([mt_3.uid])
        }
        mtc_1.depends_on << mt_2.uid
        mtc_3.depends_on << mt_1.uid
        mtc_3.depends_on << mt_2.uid
        mtc_4.depends_on << mt_3.uid

        mtc_1.save!
        mtc_2.save!
        mtc_3.save!
        mtc_4.save!

        active_services = [mtc_1, mtc_2, mtc_3, mtc_4]
        workflow = described_class.construct_workflow(active_services)
        actual = described_class.trim_workflow!(workflow, 'not-a-tool')
        expect(actual).to eq expected
      end
    end
    context 'when the marking tool passed in is nil' do
      it 'returns the workflow as it is, unchanged' do
        expected = {
          mt_1.uid => Set.new([mt_2.uid]),
          mt_2.uid => Set.new,
          mt_3.uid => Set.new([mt_1.uid, mt_2.uid]),
          mt_4.uid => Set.new([mt_3.uid])
        }
        mtc_1.depends_on << mt_2.uid
        mtc_3.depends_on << mt_1.uid
        mtc_3.depends_on << mt_2.uid
        mtc_4.depends_on << mt_3.uid

        mtc_1.save!
        mtc_2.save!
        mtc_3.save!
        mtc_4.save!

        active_services = [mtc_1, mtc_2, mtc_3, mtc_4]
        workflow = described_class.construct_workflow(active_services)
        actual = described_class.trim_workflow!(workflow, nil)
        expect(actual).to eq expected
      end
    end
  end
  describe '#simulate_workflow' do
    context 'with a nil workflow' do
      it 'returns an empty set of failed marking services' do
        mtc_1.depends_on << mt_2.uid
        mtc_3.depends_on << mt_1.uid
        mtc_3.depends_on << mt_2.uid
        mtc_4.depends_on << mt_3.uid

        mtc_1.save!
        mtc_2.save!
        mtc_3.save!
        mtc_4.save!
        active_services = [mtc_1, mtc_2, mtc_3, mtc_4]
        described_class.construct_workflow(active_services)
        actual = described_class.simulate_workflow(nil, mt_2)
        expect(Set.new).to eq actual
      end
    end
    context 'with a nil marking tool' do
      it 'returns an empty set of failed marking services' do
        mtc_1.depends_on << mt_2.uid
        mtc_3.depends_on << mt_1.uid
        mtc_3.depends_on << mt_2.uid
        mtc_4.depends_on << mt_3.uid

        mtc_1.save!
        mtc_2.save!
        mtc_3.save!
        mtc_4.save!
        active_services = [mtc_1, mtc_2, mtc_3, mtc_4]
        workflow = described_class.construct_workflow(active_services)
        actual = described_class.simulate_workflow(workflow, nil)
        expect(Set.new).to eq actual
      end
    end
    context 'with a valid workflow and marking tool that is not an active service' do
      it 'returns an empty set of failed marking services' do
        mtc_1.depends_on << mt_2.uid
        mtc_3.depends_on << mt_1.uid
        mtc_3.depends_on << mt_2.uid
        mtc_4.depends_on << mt_3.uid

        mtc_1.save!
        mtc_2.save!
        mtc_3.save!
        mtc_4.save!
        active_services = [mtc_1, mtc_2, mtc_3, mtc_4]
        workflow = described_class.construct_workflow(active_services)
        actual = described_class.simulate_workflow(workflow, mt_5.uid)
        expect(Set.new).to eq actual
      end
    end
    context 'with a valid workflow and a tool that is an active service' do
      it 'returns a non empty set of visited failed marking services' do
        expected = Set.new [mt_1.uid, mt_3.uid, mt_4.uid]
        mtc_1.depends_on << mt_2.uid
        mtc_3.depends_on << mt_1.uid
        mtc_3.depends_on << mt_2.uid
        mtc_4.depends_on << mt_3.uid

        mtc_1.save!
        mtc_2.save!
        mtc_3.save!
        mtc_4.save!
        active_services = [mtc_1, mtc_2, mtc_3, mtc_4]
        workflow = described_class.construct_workflow(active_services)
        actual = described_class.simulate_workflow(workflow, mt_2.uid)
        expect(expected).to eq actual
      end
    end
  end
end
