const test_configurations = {};

export function handle_receive_mark (request, response) {
  console.log(`Received mark from grader ${request.params.tool_uid} (submission ${request.params.sid}).`);

  if (!test_configurations[request.params.sid][request.params.tool_uid]) {
    console.log("Did not find test configuration.");
    response.status(500).send("I did not expect to be sent a mark from you.");
  } else {
    var test_config = test_configurations[request.params.sid][request.params.tool_uid];
    if (test_config.mark == request.body.mark) {
      console.log(`Received correct mark from ${request.params.tool_uid}.`);
    } else {
      console.log(`Received wrong mark ${request.body.mark} from ${request.params.tool_uid}. Was expecting ${test_config.mark}.`);
    }

    response.status(200).send("All good.");
  }
}

export function handle_receive_feedback (request, response) {
  console.log(`Received feedback from grader ${request.params.tool_uid} (submission ${request.params.sid}).`);

  if (!test_configurations[request.params.sid][request.params.tool_uid]) {
    console.log("Did not find test configuration.");
    response.status(500).send("I did not expect to be sent feedback from you.");
  } else {
    var test_config = test_configurations[request.params.sid][request.params.tool_uid];
    if (test_config.feedback != "dontcare") {
      // TODO Need to figure out a better way of identifying the actual feedback text (this may well be a good bit of HTML, so will be too long for the yml file)
      if (test_config.feedback.text == request.body.body) {
        console.log(`Received correct feedback from ${request.params.tool_uid}.`);
      } else {
        console.log(`Received wrong feedback ${request.body.body} from ${request.params.tool_uid}. Was expecting ${test_config.feedback.text}.`);
      }
    } else {
      console.log(`Ignoring feedback from grader: received "${request.body.body}".`);
    }

    response.status(200).send("All good.");
  }
}

export function handle_configure_test (request, response) {
  console.log(`Received request to configure test for grader ${request.params.tool_uid} (submission ${request.params.sid}).`);

  if (!test_configurations[request.params.sid]) {
    test_configurations[request.params.sid] = {};
  }
  test_configurations[request.params.sid][request.params.tool_uid] = request.body;

  console.log("Stored test configuration.")

  response.sendStatus(200);
}

export function handle_test_results_request  (request, response) {
  console.log("Received request for test results.");
  response.sendStatus(200);
}
