export function handle_receive_mark (request, response) {
  console.log("Received mark");
  response.status(200).send("All good.");
}

export function handle_receive_feedback (request, response) {
  console.log("Received feedback");
  response.sendStatus(200);
}

export function handle_configure_test (request, response) {
  console.log("Received request to configure test.");
  response.sendStatus(200);
}

export function handle_test_results_request  (request, response) {
  console.log("Received request for test results.");
  response.sendStatus(200);
}
