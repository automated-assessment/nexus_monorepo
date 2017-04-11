require 'rails_helper'

RSpec.describe WorkflowUtils do
  let(:mt_0) { create(:marking_tool) }
  let(:mt_1) { create(:marking_tool) }
  let(:mt_2) { create(:marking_tool) }
  let(:mt_3) { create(:marking_tool) }
  let(:mt_4) { create(:marking_tool) }

  describe '#construct_workflow' do
    context 'with 0 marking services assigned' do
      it 'returns straight away with no changes' do
        actual = described_class.construct_workflow({}, {})
        expect(actual).to eq({})
      end
    end

    context 'with a single service workflow' do
      context 'with the tool dependent on itself' do
        it 'raises a StandardError with a message' do
          contexts = { '0' => { 'marking_tool_id' => mt_0.id } }
          dependencies = { '0' => [mt_0.name] }
          expect { described_class.construct_workflow(contexts, dependencies) }.to raise_error(StandardError)
        end
      end
    end

    context 'with the tool not dependent on anything' do
      it 'creates a hash structure with a single tool' do
        expected = {
          mt_0.uid => Set.new
        }
        contexts = { '0' => { 'marking_tool_id' => mt_0.id } }
        actual = described_class.construct_workflow(contexts, nil)
        expect(actual).to eq expected
      end
    end
    context 'with a multi tool workflow' do
      context 'with a sequential structure' do
        it 'creates the appropriate hash structure' do
          expected = {
            mt_0.uid => Set.new,
            mt_1.uid => Set.new([mt_0.uid]),
            mt_2.uid => Set.new([mt_1.uid]),
            mt_3.uid => Set.new([mt_2.uid])
          }
          contexts = {
            '0' => { 'marking_tool_id' => mt_0.id },
            '1' => { 'marking_tool_id' => mt_1.id },
            '2' => { 'marking_tool_id' => mt_2.id },
            '3' => { 'marking_tool_id' => mt_3.id }
          }

          dependencies = {
            '1' => [mt_0.uid],
            '2' => [mt_1.uid],
            '3' => [mt_2.uid]
          }
          actual = described_class.construct_workflow(contexts, dependencies)
          expect(actual).to eq expected
        end
      end
      context 'with a parallel structure' do
        context 'with a cycle in marking tool contexts' do
          it 'raises a StandardError' do
            contexts = {
              '0' => { 'marking_tool_id' => mt_0.id },
              '1' => { 'marking_tool_id' => mt_1.id },
              '2' => { 'marking_tool_id' => mt_2.id },
              '3' => { 'marking_tool_id' => mt_3.id }
            }

            dependencies = {
              '0' => [mt_2.uid],
              '1' => [mt_0.uid],
              '2' => [mt_1.uid],
              '3' => [mt_2.uid]
            }
            expect { described_class.construct_workflow(contexts, dependencies) }.to raise_error(StandardError)
          end
        end

        context 'with no cycle in the marking tool contexts' do
          it 'creates the appropriate hash structure' do
            expected = {
              mt_0.uid => Set.new,
              mt_1.uid => Set.new([mt_0.uid]),
              mt_2.uid => Set.new,
              mt_3.uid => Set.new([mt_2.uid])
            }

            contexts = {
              '0' => { 'marking_tool_id' => mt_0.id },
              '1' => { 'marking_tool_id' => mt_1.id },
              '2' => { 'marking_tool_id' => mt_2.id },
              '3' => { 'marking_tool_id' => mt_3.id }
            }

            dependencies = {
              '1' => [mt_0.uid],
              '3' => [mt_2.uid]
            }

            actual = described_class.construct_workflow(contexts, dependencies)
            expect(actual).to eq expected
          end
        end
      end
      context 'with an aggregation structure' do
        context 'with a cycle in marking tool contexts' do
          it 'raises a StandardError' do
            contexts = {
              '0' => { 'marking_tool_id' => mt_0.id },
              '1' => { 'marking_tool_id' => mt_1.id },
              '2' => { 'marking_tool_id' => mt_2.id },
              '3' => { 'marking_tool_id' => mt_3.id }
            }

            dependencies = {
              '1' => [mt_0.uid],
              '2' => [mt_2.uid],
              '3' => [mt_0.uid, mt_2.uid]
            }

            expect { described_class.construct_workflow(contexts, dependencies) }.to raise_error(StandardError)
          end
        end
        context 'without a cycle in marking tool contexts' do
          it 'creates the appropriate hash structure' do
            expected = {
              mt_0.uid => Set.new([mt_1.uid]),
              mt_1.uid => Set.new,
              mt_2.uid => Set.new([mt_1.uid, mt_0.uid]),
              mt_3.uid => Set.new([mt_2.uid])
            }

            contexts = {
              '0' => { 'marking_tool_id' => mt_0.id },
              '1' => { 'marking_tool_id' => mt_1.id },
              '2' => { 'marking_tool_id' => mt_2.id },
              '3' => { 'marking_tool_id' => mt_3.id }
            }

            dependencies = {
              '0' => [mt_1.uid],
              '2' => [mt_0.uid, mt_1.uid],
              '3' => [mt_2.uid]
            }
            actual = described_class.construct_workflow(contexts, dependencies)
            expect(actual).to eq expected
          end
        end
      end
    end
  end

  describe '#next_services_to_invoke' do
    context 'with marking tools left to invoke' do
      it 'returns a non empty array of tools eligible for invocation' do
        contexts = {
          '0' => { 'marking_tool_id' => mt_0.id },
          '1' => { 'marking_tool_id' => mt_1.id },
          '2' => { 'marking_tool_id' => mt_2.id },
          '3' => { 'marking_tool_id' => mt_3.id }
        }

        dependencies = {
          '1' => [mt_0.uid],
          '2' => [mt_0.uid],
          '3' => [mt_1.uid, mt_2.uid]
        }

        expected = [mt_0.uid]

        active_services = described_class.construct_workflow(contexts, dependencies)
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
          mt_2.uid => Set.new,
          mt_3.uid => Set.new([mt_1.uid, mt_2.uid])
        }

        contexts = {
          '0' => { 'marking_tool_id' => mt_0.id },
          '1' => { 'marking_tool_id' => mt_1.id },
          '2' => { 'marking_tool_id' => mt_2.id },
          '3' => { 'marking_tool_id' => mt_3.id }
        }

        dependencies = {
          '1' => [mt_0.uid],
          '2' => [mt_0.uid],
          '3' => [mt_1.uid, mt_2.uid]
        }

        workflow = described_class.construct_workflow(contexts, dependencies)

        actual = described_class.trim_workflow!(workflow, mt_0.uid)
        expect(actual).to eq expected
      end
    end
    context 'when the marking tool is not apart of the workflow' do
      it 'returns the workflow as it is, unchanged' do
        expected = {
          mt_0.uid => Set.new,
          mt_1.uid => Set.new([mt_0.uid]),
          mt_2.uid => Set.new([mt_0.uid]),
          mt_3.uid => Set.new([mt_1.uid, mt_2.uid])
        }

        contexts = {
          '0' => { 'marking_tool_id' => mt_0.id },
          '1' => { 'marking_tool_id' => mt_1.id },
          '2' => { 'marking_tool_id' => mt_2.id },
          '3' => { 'marking_tool_id' => mt_3.id }
        }

        dependencies = {
          '1' => [mt_0.uid],
          '2' => [mt_0.uid],
          '3' => [mt_1.uid, mt_2.uid]
        }

        workflow = described_class.construct_workflow(contexts, dependencies)
        actual = described_class.trim_workflow!(workflow, 'not-a-tool')
        expect(actual).to eq expected
      end
    end
    context 'when the marking tool passed in is nil' do
      it 'returns the workflow as it is, unchanged' do
        expected = {
          mt_0.uid => Set.new,
          mt_1.uid => Set.new([mt_0.uid]),
          mt_2.uid => Set.new([mt_0.uid]),
          mt_3.uid => Set.new([mt_1.uid, mt_2.uid])
        }

        contexts = {
          '0' => { 'marking_tool_id' => mt_0.id },
          '1' => { 'marking_tool_id' => mt_1.id },
          '2' => { 'marking_tool_id' => mt_2.id },
          '3' => { 'marking_tool_id' => mt_3.id }
        }

        dependencies = {
          '1' => [mt_0.uid],
          '2' => [mt_0.uid],
          '3' => [mt_1.uid, mt_2.uid]
        }

        workflow = described_class.construct_workflow(contexts, dependencies)
        actual = described_class.trim_workflow!(workflow, nil)
        expect(actual).to eq expected
      end
    end
  end
  describe '#simulate_workflow' do
    context 'with a nil workflow' do
      it 'returns an empty set of failed marking services' do
        contexts = {
          '0' => { 'marking_tool_id' => mt_0.id },
          '1' => { 'marking_tool_id' => mt_1.id },
          '2' => { 'marking_tool_id' => mt_2.id },
          '3' => { 'marking_tool_id' => mt_3.id }
        }

        dependencies = {
          '1' => [mt_0.uid],
          '2' => [mt_0.uid],
          '3' => [mt_1.uid, mt_2.uid]
        }

        described_class.construct_workflow(contexts, dependencies)
        actual = described_class.simulate_workflow(nil, mt_0)
        expect(Set.new).to eq actual
      end
    end
    context 'with a nil marking tool' do
      it 'returns an empty set of failed marking services' do
        contexts = {
          '0' => { 'marking_tool_id' => mt_0.id },
          '1' => { 'marking_tool_id' => mt_1.id },
          '2' => { 'marking_tool_id' => mt_2.id },
          '3' => { 'marking_tool_id' => mt_3.id }
        }

        dependencies = {
          '1' => [mt_0.uid],
          '2' => [mt_0.uid],
          '3' => [mt_1.uid, mt_2.uid]
        }

        workflow = described_class.construct_workflow(contexts, dependencies)
        actual = described_class.simulate_workflow(workflow, nil)
        expect(Set.new).to eq actual
      end
    end
    context 'with a valid workflow and marking tool that is not an active service' do
      it 'returns an empty set of failed marking services' do
        contexts = {
          '0' => { 'marking_tool_id' => mt_0.id },
          '1' => { 'marking_tool_id' => mt_1.id },
          '2' => { 'marking_tool_id' => mt_2.id },
          '3' => { 'marking_tool_id' => mt_3.id }
        }

        dependencies = {
          '1' => [mt_0.uid],
          '2' => [mt_0.uid],
          '3' => [mt_1.uid, mt_2.uid]
        }

        workflow = described_class.construct_workflow(contexts, dependencies)
        actual = described_class.simulate_workflow(workflow, mt_4.uid)
        expect(Set.new).to eq actual
      end
    end
    context 'with a valid workflow and a tool that is an active service' do
      it 'returns a non empty set of visited failed marking services' do
        contexts = {
          '0' => { 'marking_tool_id' => mt_0.id },
          '1' => { 'marking_tool_id' => mt_1.id },
          '2' => { 'marking_tool_id' => mt_2.id },
          '3' => { 'marking_tool_id' => mt_3.id }
        }

        dependencies = {
          '1' => [mt_0.uid],
          '2' => [mt_0.uid],
          '3' => [mt_1.uid, mt_2.uid]
        }

        workflow = described_class.construct_workflow(contexts, dependencies)
        expected = Set.new [mt_1.uid, mt_2.uid, mt_3.uid]
        actual = described_class.simulate_workflow(workflow, mt_0.uid)
        expect(expected).to eq actual
      end
    end
  end
  describe '#construct_dataflow' do
    context 'with 0 marking services assigned' do
      it 'returns straight away with no changes' do
        actual = described_class.construct_dataflow({})
        expect(actual).to eq({})
      end
    end
  end
end
