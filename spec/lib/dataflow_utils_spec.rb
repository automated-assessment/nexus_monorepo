require 'rails_helper'

RSpec.describe DataflowUtils do
  describe '#construct_dataflow' do
    context 'with 0 marking services assigned' do
      it 'returns straight away with no changes' do
        actual = described_class.construct_dataflow([])
        expect(actual).to eq({})
      end
    end
  end
end
