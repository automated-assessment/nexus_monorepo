const test_configurations = {};

export function handle_receive_mark (request, response) {
  var tool_uid = request.params.tool_uid;
  var submission_id = request.params.sid;
  console.log(`Received mark from grader ${tool_uid} (submission ${submission_id}).`);

  if (!test_configurations[submission_id][tool_uid]) {
    console.log("Did not find test configuration.");
    response.status(500).send("I did not expect to be sent a mark from you.");
    store_test_results (submission_id, tool_uid, 'mark', false, "Did not find test configuration.");
  } else {
    response.status(200).send("All good.");

    var test_config = test_configurations[submission_id][tool_uid];
    if (test_config.mark == request.body.mark) {
      console.log(`Received correct mark from ${tool_uid}.`);
      store_test_results (submission_id, tool_uid, 'mark', true, `Received correct mark from ${tool_uid}.`);
    } else {
      console.log(`Received wrong mark ${request.body.mark} from ${tool_uid}. Was expecting ${test_config.mark}.`);
      store_test_results (submission_id, tool_uid, 'mark', false,
        `Received wrong mark ${request.body.mark} from ${tool_uid}. Was expecting ${test_config.mark}.`);
    }
  }
}

export function handle_receive_feedback (request, response) {
  var tool_uid = request.params.tool_uid;
  var submission_id = request.params.sid;
  console.log(`Received feedback from grader ${tool_uid} (submission ${submission_id}).`);

  if (!test_configurations[submission_id][tool_uid]) {
    console.log("Did not find test configuration.");
    response.status(500).send("I did not expect to be sent feedback from you.");
    store_test_results (submission_id, tool_uid, 'feedback', false, "Did not find test configuration.");
  } else {
    response.status(200).send("All good.");

    var test_config = test_configurations[submission_id][tool_uid];
    if (test_config.feedback != "dontcare") {
      // TODO Need to figure out a better way of identifying the actual feedback text (this may well be a good bit of HTML, so will be too long for the yml file)
      if (test_config.feedback.text == request.body.body) {
        console.log(`Received correct feedback from ${tool_uid}.`);
        store_test_results (submission_id, tool_uid, 'feedback', true, `Received correct feedback from ${tool_uid}.`);
      } else {
        console.log(`Received wrong feedback ${request.body.body} from ${tool_uid}. Was expecting ${test_config.feedback.text}.`);
        store_test_results (submission_id, tool_uid, 'feedback', false,
          `Received wrong feedback ${request.body.body} from ${tool_uid}. Was expecting ${test_config.feedback.text}.`);
      }
    } else {
      console.log(`Ignoring feedback from grader: received "${request.body.body}".`);
      store_test_results (submission_id, tool_uid, 'feedback', true, `Ignoring feedback from grader: received "${request.body.body}".`);
    }
  }
}

// TODO: Check this correctly handles multiple configs.
export function handle_configure_test (request, response) {
  console.log(`Received request to configure test for grader ${request.params.tool_uid} (submission ${request.params.sid}).`);

  if (!test_configurations[request.params.sid]) {
    test_configurations[request.params.sid] = {};
  }
  test_configurations[request.params.sid][request.params.tool_uid] = request.body;

  console.log("Stored test configuration.")

  response.sendStatus(200);
}

// TODO: Need to cleanup as part of the callback so that subsequent invocations actually get the correct results. 
export function handle_test_results_request  (request, response) {
  var tool_uid = request.params.tool_uid;
  var submission_id = request.params.sid;
  console.log(`Received request for test results for ${tool_uid} / ${submission_id}.`);

  register_for_results (submission_id, tool_uid, (test_outcome) => {
    response.status(200).send(JSON.stringify(test_outcome));
  });
}

const test_outcomes = {};

function get_outcome_record(submission_id, tool_uid) {
  if (!test_outcomes[submission_id]) {
    test_outcomes[submission_id] = {};
  }
  if (!test_outcomes[submission_id][tool_uid]) {
    test_outcomes[submission_id][tool_uid] = {
        is_complete: false
      };
  }

  return test_outcomes[submission_id][tool_uid];
}


function register_for_results (submission_id, tool_uid, callback) {
  var test_outcome = get_outcome_record (submission_id, tool_uid);

  if (test_outcome.is_complete) {
    // Call callback directly
    callback (test_outcome);
  } else {
    // Just register the callback to be called later
    test_outcome.callback = callback;
  }
}

function store_test_results (submission_id, tool_uid, label, is_correct, message) {
  var test_outcome = get_outcome_record (submission_id, tool_uid);

  if (!test_outcome.is_complete) {
    test_outcome[label] = { is_correct, message };

    check_completeness(test_outcome);
  }
}

function check_completeness (test_outcome) {
  if (!test_outcome.is_complete) {
    if (test_outcome.mark && test_outcome.feedback) {
      test_outcome.is_complete = true;

      if (test_outcome.callback) {
        test_outcome.callback (test_outcome);
      }
    }
  }
}
