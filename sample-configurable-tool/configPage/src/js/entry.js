require("expose-loader?Config!./components/config");

import React from "react";
import { render } from "react-dom";
import ConfigComponent from "./components/config"

const mountNode = document.getElementById("configNode");

ReactDOM.render(
  <ConfigComponent />,
  mountNode
);
