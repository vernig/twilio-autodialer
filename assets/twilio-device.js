/**
 * 
 * This file handles the Twilio Device initalization
 * 
 */

var twilioDevice;

function outboundCall(number) {
  connection = twilioDevice.connect({ toNumber: number });
  callButton = event.currentTarget;
  callButton.textContent = 'Calling ...';
}

function hangup() {
  if (twilioDevice) {
    twilioDevice.disconnectAll();
  }
}

function registerTwilioDevice(clientId) {
    fetch(`/get-client-token?clientId=${clientId}`)
      .then((response) => response.json())
      .then((response) => {
        // Setup Twilio.Device
        twilioDevice = new Twilio.Device(response.token, {
          codecPreferences: ['opus', 'pcmu'],
          enableRingingState: false,
        });
  
        twilioDevice.on('ready', function (device) {
          console.log('Twilio.Device Ready!');
          document.body.classList.add('twilio-device')
          renderReservations();
        });
  
        twilioDevice.on('error', function (error) {
          console.log('Twilio.Device Error: ' + error.message);
        });
  
        twilioDevice.on('connect', function (conn) {
          console.log('Twilio.Device connected');
        });
  
        twilioDevice.on('disconnect', function (conn) {
          console.log('Call ended.');
          if (callButton) {
            callButton.textContent = 'Call again';
          }
        });

        twilioDevice.on('incoming', function (conn) {
          // Auto accept incoming calls
          conn.accept()
        })


      });
  }