import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';
import FileEditor from './FileEditor';

import 'brace/mode/java';
import 'brace/theme/github';

export default class NexusWebIDE extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
      super(props);
      this.state = {
        data: new Array({'filename': 'File.java', 'code': '// body'})
      };

      this.addFile = this.addFile.bind(this);
  }

  addFile() {
    const newData = this.state.data;
    newData.push({'filename': 'File.java', 'code': '// body'});
    this.setState({data: newData});
  }

  handleFilenameUpdate(i, e) {
    console.log(`filename changed: ${i}, ${e.target.value}`);
    let newData = this.state.data;
    newData[i].filename = e.target.value;
    this.setState({data: newData});
  }

  handleCodeUpdate(i, e) {
    console.log(`code changed: ${i}, ${e}`);
    let newData = this.state.data;
    newData[i].code = e;
    this.setState({data: newData});
  }

  render() {
    return (
      <div>
        {
          this.state.data.map((file, i) => {
            return <FileEditor
                      key={i}
                      id={`ace-${i}`}
                      defaultFilename={file.filename}
                      defaultCode={file.code}
                      updateFilename={this.handleFilenameUpdate.bind(this, i)}
                      updateCode={this.handleCodeUpdate.bind(this, i)}
                    />;
          })
        }
        <button className="btn btn-success" onClick={this.addFile}><i className="fa fa-plus"></i> Add File</button>
        <button className="btn btn-primary" style={{float: 'right'}}>Submit</button>
      </div>
    );
  }
}
