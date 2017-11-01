export function handle_receive_mark (request, response) {
  console.log("Received mark");
  response.status(200).send("All good.");
}

export function handle_receive_feedback (request, response) {
  console.log("Received feedback");
  response.sendStatus(200);
}
