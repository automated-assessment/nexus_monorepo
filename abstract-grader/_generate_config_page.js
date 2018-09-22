import yaml from 'node-yaml';
import fs from 'fs';

const configSchema = yaml.readSync ('config_schema.yml', {schema: yaml.schema.defaultSafe});
fs.writeFileSync('configPage/src/js/components/config.jsx', generateConfigComponent(configSchema));

function generateConfigComponent(configSchema) {
  if (Object.keys(configSchema.parameters).length > 0) {
    return `
    import React from "react";
    import XHR from "promised-xhr";

    export default class ConfigComponent extends React.Component {
      static propTypes = {
        aid: React.PropTypes.number,
        config: React.PropTypes.object,
        token: React.PropTypes.string
      };
      static defaultProps = {
        config: {
          ${generateDefaultPropValues(configSchema)}
        }
      };

      constructor(props) {
        super(props);
        this.state = {
          aid: this.props.aid,
          status: ""${generateStateInitalisation(configSchema)}
        }
      }

      render() {
        return (
          <div>
          <h4>{this.state.status}</h4>
          <form className="form-horizontal" onSubmit={::this.handleSubmit}>
          ${generateFormElements(configSchema)}

          <hr />
          <br />

          <div className="form-group">
          <div className="col-lg-10 col-lg-offset-2">
          <button className="btn btn-primary">Go</button>
          </div>
          </div>
          </form>
          </div>
        );
      }

      ${generateHandleChangeMethods(configSchema)}

      handleSubmit(event) {
        event.preventDefault();
        const url = \`\${document.location.origin}/\${this.props.token}/configuration\`;
        $.post(
          url,
          { aid: this.state.aid, config: { ${generateResultConfig(configSchema)} } },
          (data, status, xhr) => {
            this.setState({status: status});
          }
        )
        .fail(() => {
          this.setState({status: "failed!"});
        });
      }
    }
    `;
  } else {
    return '';
  }
}

function generateDefaultPropValues(configSchema) {
  return Object.keys(configSchema.parameters).map((pName) => {
        const val = configSchema.parameters[pName];
        if (val.type == "git") {
          return `${pName}: {
                    repository: 'git@github.kcl.ac.uk:{user}/{repo}.git',
                    branch: 'master',
                    sha: ''
                  }`;
        } else if (val.type == "string") {
          return pName + ": '" + val.initial + "'";
        } else {
          return pName + ": " + val.initial;
        }
      }).join(',\n          ');
}

function generateStateInitalisation(configSchema) {
  var init = Object.keys(configSchema.parameters).map((pName) => {
        return pName + ": " + "this.props.config." + pName;
      }).join(',\n          ');

  if (init != "") {
    init = ",\n          " + init;
  }

  return init;
}

function generateFormElements(configSchema) {
  return Object.keys(configSchema.parameters).map((pName) => {
        const val = configSchema.parameters[pName];
        if (val.type == "git") {
          return generateGitFormElement(pName, val);
        } else if (val.type == "string") {
          return generateStringFormElement(pName, val);
        } else {
          return generateNumberFormElement(pName, val);
        }
      }).join('\n<hr/>\n          ');
}

function generateNumberFormElement(pName, data) {
  return `<div className="form-group">
            <label className="col-lg-2 col-sm-2 control-label" htmlFor="${pName}">${capitalizeFirstLetter(data.label)}:</label>
            <div className="col-lg-10 col-sm-10">
              <input className="form-control"
                id="${pName}"
                type="number"
                min="${data.min}"
                max="${data.max}"
                step="${data.step}"
                defaultValue={this.state.${pName}}
                onChange={::this.handleChange${capitalizeFirstLetter(pName)}}/>
                <p>${data.description}</p>
            </div>
          </div>`;
}

function generateStringFormElement(pName, data) {
  return `<div className="form-group">
            <label className="col-lg-2 col-sm-2 control-label" htmlFor="${pName}">${capitalizeFirstLetter(data.label)}:</label>
            <div className="col-lg-10 col-sm-10">
              <input className="form-control"
                id="${pName}"
                defaultValue={this.state.${pName}}
                onChange={::this.handleChange${capitalizeFirstLetter(pName)}}/>
                <p>${data.description}</p>
            </div>
          </div>`;
}

function generateGitFormElement(pName, data) {
  return `<div>
      <h4>${capitalizeFirstLetter(data.label)}</h4>

      <p>
        ${data.description}
      </p>
      <br />

      <div className="form-group">
        <label className="col-lg-2 col-sm-2 control-label" htmlFor="${pName}_repository">Repository:</label>
        <div className="col-lg-10 col-sm-10">
          <input className="form-control"
                 id="${pName}_repository"
                 defaultValue={this.state.${pName}.repository}
                 onChange={::this.handleChange${capitalizeFirstLetter(pName)}Repository}/>
        </div>
      </div>

      <div className="form-group">
        <label className="col-lg-2 col-sm-2 control-label" htmlFor="${pName}_branch">Branch:</label>
        <div className="col-lg-10 col-sm-10">
          <input className="form-control"
                 id="${pName}_branch"
                 defaultValue={this.state.${pName}.branch}
                 onChange={::this.handleChange${capitalizeFirstLetter(pName)}Branch}/>
        </div>
      </div>

      <div className="form-group">
        <label className="col-lg-2 col-sm-2 control-label" htmlFor="${pName}_sha">SHA:</label>
        <div className="col-lg-10 col-sm-10">
          <input className="form-control"
                 id="${pName}_sha"
                 defaultValue={this.state.${pName}.sha}
                 onChange={::this.handleChange${capitalizeFirstLetter(pName)}SHA}/>
        </div>
      </div>

      <div className="form-group">
        <div className="col-lg-10 col-sm-10 col-lg-offset-2 col-sm-offset-2">
          <p>Please ensure GHE user ${process.env.GHE_USER} has read-only access to this repository.</p>
        </div>
      </div>
    </div>`;
}

function generateHandleChangeMethods(configSchema) {
  return Object.keys(configSchema.parameters).map((pName) => {
        const val = configSchema.parameters[pName];
        if (val.type == "git") {
          return `handleChange${capitalizeFirstLetter(pName)}Repository(event) {
            this.setState({${pName}: {
              repository: event.target.value,
              branch: this.state.${pName}.branch,
              sha: this.state.${pName}.sha
            }});
          }
          handleChange${capitalizeFirstLetter(pName)}Branch(event) {
            this.setState({${pName}: {
              repository: this.state.${pName}.repository,
              branch: event.target.value,
              sha: this.state.${pName}.sha
            }});
          }
          handleChange${capitalizeFirstLetter(pName)}SHA(event) {
            this.setState({${pName}: {
              repository: this.state.${pName}.repository,
              branch: this.state.${pName}.branch,
              sha: event.target.value
            }});
          }`;
        } else if (val.type == "string") {
          return `handleChange${capitalizeFirstLetter(pName)}(event) {
            this.setState({${pName}: event.target.value});
          }`;
        } else {
          return `handleChange${capitalizeFirstLetter(pName)}(event) {
            this.setState({${pName}: parseInt(event.target.value)});
          }`;
        }
      }).join('\n\n       ');
}

function generateResultConfig(configSchema) {
  return Object.keys(configSchema.parameters).map((pName) => {
        return `${pName}: this.state.${pName}`;
      }).join(', ');
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
