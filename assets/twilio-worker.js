/**
 *
 * This file handle a generic TR worker client with
 * Twilio Device initilization
 *
 */

var workerClient;
var worker;
var workerActivities = {};

function completeTask(reservationSid) {
  workerClient.fetchReservations(function (error, reservations) {
    let reservation = reservations.data.filter(
      (reservation) => reservation.sid === reservationSid
    )[0];
    if (reservation) {
      reservation.task.complete();
      renderReservations()
      // TODO: Better handling of ongoing calls
      hangup()
    } else {
      console.warn('Reservation not found');
    }
  });
}

function fetchActivities() {
  workerClient.activities.fetch(function (error, activityList) {
    for (let activity of activityList.data) {
      if (activity.friendlyName === 'Offline') {
        workerActivities.offline = activity.sid;
      } else if (activity.friendlyName === 'Available')
        workerActivities.available = activity.sid;
    }
  });
}

function toggleWorkerAvailability() {
  let newStatus = {
    ActivitySid: worker.available
      ? workerActivities.offline
      : workerActivities.available,
  };
  workerClient.update(newStatus, (error, workerInfo) => {
    if (error) {
      swal.fire({icon: 'error', text: error.message});
    } else {
      worker = workerInfo;
      renderWorker(workerInfo);
    }
  });
}

function renderWorker(workerInfo) {
  document.getElementById('worker-name').textContent = workerInfo.friendlyName;
  document.getElementById('worker-activity').textContent =
    workerInfo.activityName;
  document.getElementById('worker-available').textContent = workerInfo.available
    ? 'Available'
    : 'Not Available';

  renderReservations();
}

function registerWorker(workerSid) {
  fetch('/get-tr-token?workerSid=' + workerSid)
    .then((response) => response.text())
    .then((response) => {
      const WORKER_TOKEN = response;
      workerClient = new Twilio.TaskRouter.Worker(WORKER_TOKEN);

      workerClient.on('ready', function (workerInfo) {
        fetchActivities();
        worker = workerInfo;
        if (
          workerInfo.attributes.contact_uri &&
          workerInfo.attributes.contact_uri.startsWith('client:')
        ) {
          registerTwilioDevice(workerInfo.attributes.contact_uri.slice(7));
        } else {
          console.warn(
            'Twilio Audio device not enabled. The worker "contact_uri" is either missing or not in the form "client:xxxx"'
          );
        }
        renderWorker(workerInfo);
      });

      workerClient.on('reservation.created', function (reservation) {
        renderReservations();
      });

      workerClient.on('reservation.accepted', function (reservation) {
        renderReservations();
      });

      workerClient.on('reservation.canceled', function (reservation) {
        renderReservations();
      });

      workerClient.on('activity.update', function (workerInfo) {
        worker = workerInfo;
        renderWorker(workerInfo)
        renderReservations()
      })
    });
}
