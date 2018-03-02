require("expose-loader?Config!./components/config");

import React from "react";
import { render } from "react-dom";
import ConfigComponent from "./components/config"
var ConfComponent = React.createFactory(ConfigComponent)

const mountNode = document.getElementById("configNode");

ReactDOM.render(
  ConfComponent(window.CONFIG_PROPS),
  mountNode
);
