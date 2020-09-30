exports.handler = function (context, event, callback) {
  const client = context.getTwilioClient();
  console.log(event);
  if (event.autodialer === 'progressive') {
    // Create Task
    client.taskrouter
      .workspaces(process.env.TWILIO_TR_WORKSPACE_SID)
      .tasks.create({
        attributes: JSON.stringify({
          autodialer: 'progressive',
          from: process.env.TWILIO_FROM_NUMBER,
          to: event.to,
          ui: `Click to dial call to <strong>${event.name}</strong> (tel: ${event.to})<br><strong>Reason</strong>: ${event.reason}<br/><strong>Script</strong>: Hello ${event.name.split(' ')[0]}, my name is Giuseppe and I'm calling you today to discuss...`,
        }),
        priority: event.priority || 0,
        workflowSid: process.env.TWILIO_TR_WORKFLOW_SID,
        taskChannel: 'voice',
      })
      .then((task) => {
        console.log('task created');
        callback(null, task.sid);
      })
      .catch((err) => {
        console.log(`autodialer:`, err);
        callback(501, err);
      });
  } else if (event.autodialer === 'predictive') {
    // Trigger Studio Flow
    client.studio
      .flows(process.env.TWILIO_STUDIO_PREDICTIVE_FLOW)
      .executions.create({
        to: event.to,
        from: process.env.TWILIO_FROM_NUMBER,
        parameters: {
          reason: event.reason,
          ui: `Predictive call to <strong>${event.name}</strong> (tel:${event.to}<br/><strong>Reason</strong>: ${event.reason}<br/><strong>Script</strong>: Hello ${event.name.split(' ')[0]}, my name is Giuseppe and I'm calling you today to discuss...`,
        },
      })
      .then((execution) => {
        console.log(execution.sid);
        callback(null, execution.sid);
      })
      .catch((err) => {
        console.log(err);
        callback(500, err);
      });
  }
};
