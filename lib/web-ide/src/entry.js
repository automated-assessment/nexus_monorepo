require("expose?NexusWebIDE!./components/web-ide");

import React from "react";
import { render } from "react-dom";
import NexusWebIDE from "./components/web-ide"

const mountNode = document.getElementById("web-ide-mount-node");

// get props
const formAuthenticityToken = document.getElementsByTagName('meta')["csrf-token"].content;
const submitURL = document.getElementById("submiturl").value;
const assignmentID = document.getElementById("submission-aid").value;

ReactDOM.render(
  <NexusWebIDE
    formAuthenticityToken={formAuthenticityToken}
    submitURL={submitURL}
    assignmentID={assignmentID}
  />,
  mountNode
);
