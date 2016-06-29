import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/theme/github';

export default class FileEditor extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    handleRemove: React.PropTypes.func,
    updateFilename: React.PropTypes.func,
    updateCode: React.PropTypes.func,
    filename: React.PropTypes.string,
    code: React.PropTypes.string
  };
  static defaultProps = {};

  constructor(props) {
      super(props);
      this.state = {};
  }

  render() {
    return (
      <div>
        <div className="editor-container">
          <div className="editor-header">
            Filename: <input type="text" value={this.props.filename} onChange={this.props.updateFilename}></input>
            <button className="btn btn-xs btn-danger" style={{float: 'right'}} onClick={this.props.handleRemove}><i className="fa fa-remove"></i> Remove</button>
          </div>
          <AceEditor
            height="200px"
            width="100%"
            mode="java"
            theme="github"
            name={this.props.id}
            fontSize={13}
            value={this.props.code}
            onChange={this.props.updateCode}
          />
        </div>
      </div>
    );
  }
}
