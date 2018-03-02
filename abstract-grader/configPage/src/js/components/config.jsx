import React from "react";
import XHR from "promised-xhr";

export default class ConfigComponent extends React.Component {
  static propTypes = {
    aid: React.PropTypes.number,
    initMin: React.PropTypes.number,
    initMax: React.PropTypes.number
  };
  static defaultProps = {
    initMin: 0,
    initMax: 100
  };

  constructor(props) {
      super(props);
      this.state = {
        aid: this.props.aid,
        min: this.props.initMin,
        max: this.props.initMax,
        status: ""
      }
  }

  render() {
    return (
      <div>
        <h1>Configuration page for assignment {this.state.aid}</h1>
        <h4>{this.state.status}</h4>
        <form onSubmit={::this.handleSubmit}>
          Min:
          <input
          type="number"
          min="0"
          max="100"
          step="1"
          defaultValue={this.state.min}
          onChange={::this.handleChangeMin}
          />
          <br />
          Max:
          <input
          type="number"
          min="0"
          max="100"
          step="1"
          defaultValue={this.state.max}
          onChange={::this.handleChangeMax}
          />
          <br />
          <button>Go</button>
        </form>
      </div>
    );
  }

  handleChangeMin(event) {
    this.setState({min: parseInt(event.target.value)});
  }

  handleChangeMax(event) {
    this.setState({max: parseInt(event.target.value)});
  }

  handleSubmit(event) {
    event.preventDefault();
    const url = `${document.location.origin}/configuration`;
    $.post(
      url,
      { aid: this.state.aid, config: { min: this.state.min, max: this.state.max } },
      (data, status, xhr) => {
        this.setState({status: status});
      }
    )
    .fail(() => {
      this.setState({status: "failed!"});
    });
  }
}
