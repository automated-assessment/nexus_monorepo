import jsonfile from 'jsonfile';
import fs from 'fs';

const configSchema = jsonfile.readFileSync('config_schema.json');
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
  return configSchema.parameters.map((val) => {
        return val.name + ": " + val.initial;
      }).join(',\n          ');
}

function generateStateInitalisation(configSchema) {
  var init = configSchema.parameters.map((val) => {
        return val.name + ": " + "this.props.config." + val.name;
      }).join(',\n          ');

  if (init != "") {
    init = ",\n          " + init;
  }

  return init;
}

function generateFormElements(configSchema) {
  // TODO support other types
  return configSchema.parameters.map((val) => {
        return `${capitalizeFirstLetter(val.label)} (${val.description}): <input type="number"
                                                           min="${val.min}"
                                                           max="${val.max}"
                                                           step="${val.step}"
                                                           defaultValue={this.state.${val.name}}
                                                           onChange={::this.handleChange${capitalizeFirstLetter(val.name)}}/>`;
      }).join('<br />\n          ');
}

function generateHandleChangeMethods(configSchema) {
  // TODO support other types
  return configSchema.parameters.map((val) => {
        return `handleChange${capitalizeFirstLetter(val.name)}(event) {
          this.setState({${val.name}: parseInt(event.target.value)});
        }`;
      }).join('\n\n       ');
}

function generateResultConfig(configSchema) {
  return configSchema.parameters.map((val) => {
        return `${val.name}: this.state.${val.name}`;
      }).join(', ');
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
