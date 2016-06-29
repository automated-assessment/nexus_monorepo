import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/theme/github';

export default class NexusWebIDE extends React.Component {
  static propTypes = {};
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
            Filename: <input type="text" defaultValue="Foo.java"></input>
          </div>
          <AceEditor
            width="100%"
            mode="java"
            theme="github"
            name="ace"
            fontSize={14}
          />
        </div>
        <button className="btn btn-primary">Submit</button>
      </div>
    );
  }
}
