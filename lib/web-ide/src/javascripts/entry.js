require("expose?NexusWebIDE!./components/web-ide");

import React from "react";
import { render } from "react-dom";
import NexusWebIDE from "./components/web-ide"

const mountNode = document.getElementById("web-ide-mount-node");

ReactDOM.render(
  <NexusWebIDE />,
  mountNode
);
