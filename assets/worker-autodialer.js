/**
 * This file implements the functionalities of the
 * predicive / progressive autodialer solution,
 * including the UI handling.
 *
 * This is also provides the main function (bottom
 * of this file)
 *
 */

var callButton;
let connection;

function createCallButton(number) {
  return `<button type="button" class="btn btn-success m-1" onclick="outboundCall(${number})">Call ${number}</button>`;
}

function createHangupButton() {
  return `<button type="button" onclick="hangup()" class="btn btn-danger m-1">Hang-up</button>`;
}

function acceptReservation(reservationSid) {
  workerClient.fetchReservations(function (error, reservations) {
    let reservation = reservations.data.filter(
      (reservation) => reservation.sid === reservationSid
    )[0];

    if (reservation.task.taskChannelUniqueName === 'voice') {
      // Progressive dialer
      // Show the buttons for outbound calling
      if (
        reservation.task.attributes.autodialer &&
        reservation.task.attributes.autodialer === 'progressive'
      ) {
        reservation.accept(function (error, reservation) {
          if (!error) {
            renderReservations();
          }
        });
      } else {
        // Inbound voice task / Predictive dialer
        // Conference the call
        reservation.conference(
          function (error, reservation) {
            if (!error) {
              renderReservations();
            }
          },
          { endConferenceOnExit: true }
        );
      }
    }
  });
}

function renderReservations() {
  workerClient.fetchReservations(function (error, reservations) {
    reservationGroup = document.getElementById('reservations-group');
    reservationGroup.innerHTML = '';
    reservations.data.forEach((reservation) => {
      if (
        reservation.reservationStatus !== 'timeout' &&
        reservation.task.assignmentStatus !== 'completed' &&
        reservation.task.assignmentStatus !== 'canceled'
      ) {
        if (reservation.task.priority > 0) {
          // Place task with priority on the top of the reservations' list
          // TODO: Better handling of priority
          reservationGroup.innerHTML =
            `<li class="list-group-item high-priority">
            ${reservation.task.attributes.ui.replace(/\n/g, '<br/>')}
            ${renderReservationButtons(reservation)}</li>` +
            reservationGroup.innerHTML;
        } else {
          reservationGroup.innerHTML += `<li class="list-group-item">
            ${reservation.task.attributes.ui.replace(/\n/g, '<br/>')}
            ${renderReservationButtons(reservation)}</li>`;
        }
      }
    });
  });
}

function renderReservationButtons(reservation) {
  buttons = '';
  switch (reservation.reservationStatus) {
    case 'pending':
      buttons = `<button type="button" class="btn btn-primary float-right" onclick="this.disabled = true; this.textContent = 'Accepting...'; acceptReservation('${reservation.sid}')">Accept</button>`;
      break;
    case 'accepted':
      if (
        (reservation.task.taskChannelUniqueName === 'voice') &
        document.body.classList.contains('twilio-device')
      ) {
        // Render outbound call buttons
        const taskAttributes = reservation.task.attributes;
        if (
          taskAttributes.autodialer &&
          taskAttributes.autodialer === 'progressive'
        ) {
          buttons += createCallButton(taskAttributes.to);
          buttons += createHangupButton();
        } else {
          // Render inbound call buttons
          buttons += createHangupButton();
        }
      }
      // Add Task complete button
      buttons += `<button type="button" class="btn btn-info float-right" onclick="this.disabled = true; completeTask('${reservation.sid}')">Complete task</button>`;
      break;
  }

  return `<p class="mt-3">${buttons}</p>`;
}

/**
 * Main
 */

if (!WORKER_SID) {
  window.alert(
    'Provide worker sid in the url: e.g. http://yourserver.com/worker.html?workerSid=WKXXXX'
  );
} else {
  registerWorker(WORKER_SID);
}
