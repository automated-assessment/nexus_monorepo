import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/theme/github';

export default class FileEditor extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    updateFilename: React.PropTypes.func,
    updateCode: React.PropTypes.func,
    defaultFilename: React.PropTypes.string,
    defaultCode: React.PropTypes.string
  };
  static defaultProps = {
    defaultFilename: 'Filename.java',
    defaultCode: '// your code goes here'
  };

  constructor(props) {
      super(props);
      this.state = {};
  }

  render() {
    return (
      <div>
        <div className="editor-container">
          <div className="editor-header">
            Filename: <input type="text" defaultValue={this.props.defaultFilename} onChange={this.props.updateFilename}></input>
          </div>
          <AceEditor
            height="100px"
            width="100%"
            mode="java"
            theme="github"
            name={this.props.id}
            fontSize={14}
            value={this.props.defaultCode}
            onChange={this.props.updateCode}
          />
        </div>
      </div>
    );
  }
}
