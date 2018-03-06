require("expose-loader?Config!./components/config");

import React from "react";
import { render } from "react-dom";
import ConfigComponent from "./components/config"
var ConfComponent = React.createFactory(ConfigComponent)

const mountNode = document.getElementById("configNode");
var initProps = {
  aid: window.AID,
  token: window.TOKEN
};
if (window.CONFIG_PROPS) {
  initProps.config = window.CONFIG_PROPS;
}

ReactDOM.render(
  ConfComponent(initProps),
  mountNode
);
