import jsonfile from 'jsonfile';
import fs from 'fs';

const configSchema = jsonfile.readFileSync('config_schema.json');
const deployKey = fs.readFileSync('/root/.ssh/id_rsa.pub');
fs.writeFileSync('configPage/src/js/components/config.jsx', generateConfigComponent(configSchema), {mode: 0o666});

function generateConfigComponent(configSchema) {
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
          <h1>Configuration page for assignment {this.state.aid}</h1>
          <h4>{this.state.status}</h4>
          <form onSubmit={::this.handleSubmit}>
            ${generateFormElements(configSchema)}
            <br />
            <button>Go</button>
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
          return `${capitalizeFirstLetter(val.label)} (${val.description}): <br />
                  <p>
                    Please ensure the following key is added as a read-only deploy key to this repository:
                    <pre style={{whiteSpace: "pre-wrap"}}>
                      ${deployKey}
                    </pre>
                  </p>
                  Repository: <input defaultValue={this.state.${pName}.repository} onChange={::this.handleChange${capitalizeFirstLetter(pName)}Repository}/>
                  <br />
                  Branch: <input defaultValue={this.state.${pName}.branch} onChange={::this.handleChange${capitalizeFirstLetter(pName)}Branch}/>
                  <br />
                  SHA: <input defaultValue={this.state.${pName}.sha} onChange={::this.handleChange${capitalizeFirstLetter(pName)}SHA}/>`;
        } else {
          return `${capitalizeFirstLetter(val.label)} (${val.description}): <input type="number"
                                                             min="${val.min}"
                                                             max="${val.max}"
                                                             step="${val.step}"
                                                             defaultValue={this.state.${pName}}
                                                             onChange={::this.handleChange${capitalizeFirstLetter(pName)}}/>`;
        }
      }).join('<br />\n          ');
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
