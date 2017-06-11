/*
 This demo shows how to detect speech events from microphone data using the speechcapture library,
 and encode each event into WAV format audio buffers. No Web Audio API support is needed for this to work unless you
 specify the audioResultType as speechcapture.AUDIO_RESULT_TYPE.WEBAUDIO_AUDIOBUFFER.
 */

var timerInterVal = null,
    totalNoOfSpeechEvents = 0,
    totalNoOfSpeechCaptured = 0,
    totalNoOfSpeechErrors = 0,
    captureCfg = {},

    availableCordova = false,
    availableAudioInputPlugin = false,
    availableSpeechCapture = false;

/**
 * Called when speech has been captured
 * @param audioBuffer
 * @param type speechcapture.AUDIO_RESULT_TYPE
 */
function onSpeechCaptured(audioBuffer, type) {
    totalNoOfSpeechCaptured++;
    handleAudioBuffer(audioBuffer, type);
}

/**
 * Called when a speechcapture error has occurred
 * @param error
 */
function onSpeechError(error) {
    totalNoOfSpeechErrors++;
    alert("onSpeechError event recieved: " + JSON.stringify(error));
    stopCapture();
}


/**
 * Called when the speechcapture status changes
 * @param code
 */
function onSpeechStatus(code) {
    totalNoOfSpeechEvents++;

    switch (code) {
        case speechcapture.STATUS.CAPTURE_STARTED:
            consoleMessage("Capture Started!");
            turnOffSpeakingRightNowIndicator();
            break;
        case speechcapture.STATUS.CAPTURE_STOPPED:
            consoleMessage("Capture Stopped!");
            resetSpeakingRightNowIndicator();
            break;
        case speechcapture.STATUS.SPEECH_STARTED:
            consoleMessage("Speech Started!");
            turnOnSpeakingRightNowIndicator();
            break;
        case speechcapture.STATUS.ENCODING_ERROR:
            totalNoOfSpeechErrors++;
            consoleMessage("Encoding Error!");
            break;
        case speechcapture.STATUS.CAPTURE_ERROR:
            totalNoOfSpeechErrors++;
            consoleMessage("Capture Error!");
            break;
        case speechcapture.STATUS.SPEECH_ERROR:
            totalNoOfSpeechErrors++;
            consoleMessage("Speech Error!");
            break;
        case speechcapture.STATUS.SPEECH_MAX_LENGTH:
            consoleMessage("Max Length Occurred!");
            break;
        case speechcapture.STATUS.SPEECH_MIN_LENGTH:
            consoleMessage("Min Length Occurred!");
            break;
        default:
        case speechcapture.STATUS.SPEECH_STOPPED:
            consoleMessage("Speech Stopped!");
            turnOffSpeakingRightNowIndicator();
            break;
    }
}


/**
 *
 */
var startCapture = function () {
    try {
        if (!speechcapture.isCapturing()) {

            totalNoOfSpeechCaptured = 0;
            totalNoOfSpeechErrors = 0;
            totalNoOfSpeechEvents = 0;

            var audioSourceElement = document.getElementById("audioSource"),
                audioSourceType = audioSourceElement.options[audioSourceElement.selectedIndex].value,

                audioResultTypeElement = document.getElementById("audioResultType"),
                audioResultType = parseInt(audioResultTypeElement.options[audioResultTypeElement.selectedIndex].value),

                speechThreshold = parseInt(document.getElementById('speechThreshold').value),
                speechMin = parseInt(document.getElementById('minSpeechLength').value),
                speechMax = parseInt(document.getElementById('maxSpeechLength').value),
                speechAllowedDelay = parseInt(document.getElementById('speechAllowedDelay').value),
                analysisChunkLength = parseInt(document.getElementById('analysisChunkLength').value),
                sampleRate = parseInt(document.getElementById('sampleRate').value),
                bufferSize = parseInt(document.getElementById('bufferSize').value),

                compressPausesElement = document.getElementById("compressPauses"),
                compressPauses = (parseInt(compressPausesElement.options[compressPausesElement.selectedIndex].value) === 1),

                preferGUMElement = document.getElementById("preferGUM"),
                preferGUM = (parseInt(preferGUMElement.options[preferGUMElement.selectedIndex].value) === 1),

                detectOnlyElement = document.getElementById("detectOnly"),
                detectOnly = (parseInt(detectOnlyElement.options[detectOnlyElement.selectedIndex].value) === 1);

            captureCfg = {
                audioSourceType: parseInt(audioSourceType),
                audioResultType: audioResultType,
                speechDetectionThreshold: speechThreshold,
                speechDetectionMinimum: speechMin,
                speechDetectionMaximum: speechMax,
                speechDetectionAllowedDelay: speechAllowedDelay,
                analysisChunkLength: analysisChunkLength,
                sampleRate: sampleRate,
                bufferSize: bufferSize,
                compressPauses: compressPauses,
                preferGUM: preferGUM,
                detectOnly: detectOnly,
                audioInputPluginActive: true,
                debugAlerts: true, // Just for debug
                debugConsole: true // Just for debug
            };

            speechcapture.start(captureCfg, onSpeechCaptured, onSpeechError, onSpeechStatus);

            // Throw previously created audio
            document.getElementById("recording-list").innerHTML = "";

            // Start the Interval that outputs time and debug data while capturing
            //
            timerInterVal = setInterval(function () {
                if (speechcapture.isCapturing()) {
                    document.getElementById("infoTimer").innerHTML = "" +
                        new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") +
                        "| Events:" + totalNoOfSpeechEvents + " | Captured:" + totalNoOfSpeechCaptured + " | Error:" + totalNoOfSpeechErrors + "<br>" +
                        "dB: " + speechcapture.getCurrentVolume();

                    document.getElementById("status-list").innerHTML = "" +
                        JSON.stringify(speechcapture.getMonitoringData());
                }
            }, 250);

            disableStartButton();
        }
    }
    catch (e) {
        alert("startCapture exception: " + e);
    }
};


/**
 *
 */
var stopCapture = function () {
    try {
        if (speechcapture.isCapturing()) {
            if (timerInterVal) {
                clearInterval(timerInterVal);
            }

            speechcapture.stop();
        }

        resetSpeakingRightNowIndicator();
        disableStopButton();
    }
    catch (e) {
        alert("stopCapture exception: " + e);
    }
};


/**
 *
 * @param audioBuffer
 * @param type speechcapture.AUDIO_RESULT_TYPE
 */
var handleAudioBuffer = function (audioBuffer, type) {
    try {
        switch (type) {
            case speechcapture.AUDIO_RESULT_TYPE.WEBAUDIO_AUDIOBUFFER:
                appendWebAudioBuffer(audioBuffer);
                break;

            case speechcapture.AUDIO_RESULT_TYPE.RAW_DATA:
                appendRAWAudioBuffer(audioBuffer);
                break;

            case speechcapture.AUDIO_RESULT_TYPE.WAV_BLOB:
                appendWAVAudioBuffer(audioBuffer);
                break;

            case speechcapture.AUDIO_RESULT_TYPE.DETECTION_ONLY:
                appendDetectionOnlyCapture();
                break;

            default:
                alert("handleAudioBuffer - Unknown type of Audio result: " + captureCfg.audioSourceType);
                break;
        }
    }
    catch (e) {
        alert("handleAudioBuffer ex: " + e);
    }
};


/**
 *
 * @param audioBuffer
 */
var appendWAVAudioBuffer = function (audioBuffer) {
    try {
        var reader = new FileReader();
        reader.onload = function (evt) {
            var audio = document.createElement("AUDIO");
            audio.controls = true;
            audio.src = evt.target.result;
            audio.type = "audio/wav";
            document.getElementById("recording-list").appendChild(audio);
        };
        reader.readAsDataURL(audioBuffer);
        consoleMessage("Audio added...");
    }
    catch (e) {
        alert("appendWAVAudioBuffer ex: " + e);
    }
};



/**
 *
 * @param audioBuffer
 */
var appendRAWAudioBuffer = function (audioBuffer) {
    try {
        var div = document.createElement("div"),
            length = audioBuffer.length;
        div.innerHTML = 'Raw Audio (' + length + " bytes)";
        div.className = 'audio-element';

        document.getElementById("recording-list").appendChild(div);
        consoleMessage("Raw Audio Data added...");
    }
    catch (e) {
        alert("appendRAWAudioBuffer ex: " + e);
    }
};


/**
 *
 * @param audioBuffer
 */
var appendWebAudioBuffer = function (audioBuffer) {
    try {
        var btn = document.createElement("div"),
            duration = audioBuffer.duration;
        btn.innerHTML = 'Play (' + parseFloat(duration).toFixed(1) + "s)";
        btn.className = 'audio-element';

        btn.href ="#";

        // Play the audio when tapped/clicked
        btn.onclick = function(){
            try {
                var source = speechcapture.getAudioContext().createBufferSource();
                source.buffer = audioBuffer;
                source.connect(speechcapture.getAudioContext().destination);
                source.start();
            }
            catch(e) {
                alert("appendWebAudioBuffer exception: " + e);
            }
        };

        document.getElementById("recording-list").appendChild(btn);
        consoleMessage("Audio added...");
    }
    catch (e) {
        alert("appendWAVAudioBuffer ex: " + e);
    }
};


/**
 *
 */
var appendDetectionOnlyCapture = function () {
    try {
        var div = document.createElement("div");
        div.innerHTML = 'Detection Event';
        div.className = 'audio-element';

        document.getElementById("recording-list").appendChild(div);
        consoleMessage("Detection Event added...");
    }
    catch (e) {
        alert("appendDetectionOnlyCapture ex: " + e);
    }
};


/**
 *
 */
var initUIEvents = function () {
    document.getElementById("startCapture").addEventListener("click", startCapture);
    document.getElementById("stopCapture").addEventListener("click", stopCapture);
};


/**
 * When cordova fires the deviceready event, we initialize everything needed for audio input.
 */
var onDeviceReady = function () {

    availableSpeechCapture = true;
    availableCordova = true;
    availableAudioInputPlugin = true;

    if (!window.speechcapture) {
        availableSpeechCapture = false;
    }

    if (!window.cordova) {
        availableCordova = false;
    }

    if (!window.audioinput) {
        availableAudioInputPlugin = false;
    }


    if(availableSpeechCapture) {
        initUIEvents();
        consoleMessage("Use 'Start Capture' to begin...");
    }
    else {
        consoleMessage("Missing: speechcapture library!");
        disableAllButtons();
    }
};


// Make it possible to run the demo on desktop
if (!window.cordova) {
    // Make it possible to run the demo on desktop
    console.log("Running on desktop!");
    onDeviceReady();
}
else {
    // For Cordova apps
    document.addEventListener('deviceready', onDeviceReady, false);
}

/**
 *
 */
var turnOnSpeakingRightNowIndicator = function () {
    var el = document.getElementById('speakingRightNow');
    if (el) {
        el.innerHTML = 'SPEAKING';
    }
};

/**
 *
 */
var turnOffSpeakingRightNowIndicator = function () {
    var el = document.getElementById('speakingRightNow');
    if (el) {
        el.innerHTML = 'SILENT';
    }
};

/**
 *
 */
var resetSpeakingRightNowIndicator = function () {
    var el = document.getElementById('speakingRightNow');
    if (el) {
        el.innerHTML = '';
    }
};

resetSpeakingRightNowIndicator();
