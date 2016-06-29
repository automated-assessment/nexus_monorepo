import React from 'react';
import XHR from 'promised-xhr';
import brace from 'brace';
import AceEditor from 'react-ace';
import FileEditor from './FileEditor';

import 'brace/mode/java';
import 'brace/theme/github';

export default class NexusWebIDE extends React.Component {
  static propTypes = {
    formAuthenticityToken: React.PropTypes.string.isRequired,
    submitURL: React.PropTypes.string.isRequired,
    assignmentID: React.PropTypes.string.isRequired,
    defaultCode: React.PropTypes.string
  };
  static defaultProps = {
    defaultCode: '// Your code goes here'
  };

  constructor(props) {
      super(props);
      this.state = {
        data: new Array({'filename': 'File1.java', 'code': this.props.defaultCode}),
        count: 1
      };

      this.addFile = this.addFile.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  addFile() {
    const newData = this.state.data;
    const newCount = this.state.count + 1;
    newData.push({'filename': `File${newCount}.java`, 'code': this.props.defaultCode});
    this.setState({data: newData, count: newCount});
  }

  removeFile(i, e) {
    const newData = this.state.data;
    newData.splice(i, 1)
    this.setState({data: newData});
    this.forceUpdate();
  }

  handleFilenameUpdate(i, e) {
    let newData = this.state.data;
    newData[i].filename = e.target.value;
    this.setState({data: newData});
  }

  handleCodeUpdate(i, e) {
    let newData = this.state.data;
    newData[i].code = e;
    this.setState({data: newData});
  }

  handleSubmit() {
    XHR.post(this.props.submitURL, {
      data: {
        authenticity_token: this.props.formAuthenticityToken,
        aid: this.props.assignmentID,
        data: this.state.data
      }
    }).then((res) => {
      console.log(`OK!`);
      window.location.replace(res.body.redirect);
    }).catch((res) => {
      console.log(`Error! ${JSON.stringify(res)}`);
    });
  }

  render() {
    return (
      <div>
        {
          this.state.data.map((file, i) => {
            return <FileEditor
                      key={i}
                      id={`ace-${i}`}
                      filename={file.filename}
                      code={file.code}
                      handleRemove={this.removeFile.bind(this, i)}
                      updateFilename={this.handleFilenameUpdate.bind(this, i)}
                      updateCode={this.handleCodeUpdate.bind(this, i)}
                    />;
          })
        }
        <button className="btn btn-success" onClick={this.addFile}><i className="fa fa-plus"></i> Add File</button>
        <button className="btn btn-primary" onClick={this.handleSubmit} style={{float: 'right'}}>Submit</button>
      </div>
    );
  }
}
