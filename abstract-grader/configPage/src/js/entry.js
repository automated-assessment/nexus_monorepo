require("expose-loader?Config!./components/config");

import React from "react";
import { render } from "react-dom";
import ConfigComponent from "./components/config"
var ConfComponent = React.createFactory(ConfigComponent)

const mountNode = document.getElementById("configNode");
const initProps = {
  vals: window.CONFIG_PROPS,
  token: TOKEN
};

ReactDOM.render(
  ConfComponent(initProps),
  mountNode
);
