# Predictive / Progressive autodialer using Twilio Studio and TaskRouter

This repo contains some reference code for a Predictive and progressive autodialer based on: 

* Twilio Programmable Voice 
* Twilio Studio 
* Twilio TaskRouter 

Other products used in this repo are: 

* Twilio serverless (Functions and Assets)
* Twilio Programmable Messaging 
* TaskrouterJS

# Set-up 

## Step 1 - Create a Twilio account and purchase a number

Create a Twilio Free account using [this link]( www.twilio.com/referral/f0TwNm) and purchase a phone number. This number will be used to send call from. 

## Step 2 - Create TwiML Bin 

This TwiML bin will be used (together with the TwiML App in the Step 3) to create an outbound call: 

* Navigate to [TwiML Bin](https://www.twilio.com/console/twiml-bins) section in the Twilio Console
* Click on the + button to create a new TwiML
* Give it a friendly name and copy the following xml in the TwiML text area

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial callerId="<NUMBER PURCHASED AT STEP1>">
        <Number>{{toNumber}}</Number>
    </Dial>
</Response>
```
* where `<NUMBER PURCHASED AT STEP1>` is the number purchased at step 1 (including the + sign)
* Click on Save 
* Copy the URL (you will need it later)

## Step 3 - Create a TwiML App

The TwiML app will be used later on to make outbound call from your browser (for the Progressive Autodialer use case). 

* Go to [TwiML App](https://www.twilio.com/console/voice/twiml/apps) on the console
* Press the + button to create a new App and give it a freindly name 
* In the "Voice Request URL" paste the TwiML bin URL you created in Step 2 
* Copy the SID (it's the long string starting with `AP`). You will need it later 
* Click on Save 

## Step 4 - Create an API Key 

This API key will be used to enable voice calls from browser. 

* Navigate to [API Keys](https://www.twilio.com/console/voice/settings/api-keys) section in the console 
* Click on the + button 
* Give a name and click "Create a key"
* Copy API Key and secret (this is very important because the key is shown only once)

## Step 5 - Create a TaskRouter workspace and worker 

If you don't have it already, create a new TaskRouter workspace: 

* Got to [TaskRouter Dashboard](https://www.twilio.com/console/taskrouter/dashboard)
* Click on the + button 
* Give the workspace a name 
* Write down the Workspace SID
* Click on Workers 
* Create a new worker using the + button 
* Make sure the worker has the following attribute: `"contact_uri": "client:<username>"` where `<username>` is a id of your choice 
* Write down the worker SID 

## Step 6 - Create a new Studio Flow 

This is the Studio Flow which will place the outbound call to your customer for the Predictive autodialer. 

* Go to [Studio Dashboard](https://www.twilio.com/console/studio) in the Twilio Console 
* Click on the + button 
* Give a name to the Flow and click Next 
* Select "Import from JSON" and click Next 
* Copy the content of the `studio-flow.json` into the text area and click nex 
* Once created take note of the SID of new Studio flow 


## Step 7 - Initialize `.env` file 

In the terminal use the following command: 

```shell
npx configure-env 
```

and provide the information you have collected in the previous steps. 

If you don't have `npx` installed, you can do the same manually: 

* Copy `.env.example` to `.env`
* Fill up the following info: 
  * `ACCOUNT_SID`: Twilio Account SID
  * `AUTH_TOKEN`: Twilio Auth Token 
  * `TWILIO_API_KEY`: API key created in Step 4 
  * `TWILIO_API_SECRET`: API secret for the API Key created in Step 3 
  * `TWILIO_TR_WORKSPACE_SID`: SID of the TaskRouter Workspace you created in Step 5 
  * `TWILIO_TR_WORKFLOW_SID`: The SID of the workflow `Default FIFO Workflow` automatically created in Step 5
  * `TWILIO_STUDIO_PREDICTIVE_FLOW`: The SID of the flow created in Step 6
  * `TWILIO_FROM_NUMBER`: The phone number (including the + sign) purchased in Step 1 
  * `TWILIO_OUTGOING_APPLICATION_SID`: Application SID for the TwiML App created in Step 3

# Deploy 

To deploy the serverless app (functions and assets) use: 

```
npm run deploy
```

At the end of the script, wite down the address of `autodialer.html` and `worker.html`

# Usage 

You need two browser windows for the demo: 

* Worker Interface: this is the `worker.html` address printed out by the deploy script, e.g `https://xxxx-xxxx-xxxxx-dev.twil.io/worker.html?workerSid=<worker_sid>`. `<worker_sid>` is the Worker SID created in step 5 
* Autodialer interface: this is the `autodialer` address printed out by the deploy script, e.g. `https://xxxx-xxxx-xxxxx-dev.twil.io/autodialer.html`