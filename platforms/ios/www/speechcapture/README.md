# Speech Capture
Speech detection and capture library used to detect and capture speech from an incoming audio stream of data, typically 
from the microphone.

When capture is started, the overall ambient audio level is continuously calculated from the characteristics of the audio 
input. The ambient audio level together with the threshold for speech detection, are used to generate a dynamic threshold 
in real-time. When the current audio levels surpasses the dynamic threshold, speech capture starts and ends when the 
current levels decreases below the threshold. A number of parameters also allows you to, among other things, specify the 
minimum and maximum length of captured speech as well as the allowed delay before capture is stopped. This particular 
method seems to provide a good balance between performance and quality.

Supports resampling (up or down) of the captured audio, and together with the **compressPauses** parameter, this library
can be used not only for speech detection & capture, but also to minimize the amount of audio sent to a server or saved 
to a file.

Currently this library supports two types of audio input:
* __[getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia)__
* __Apache Cordova__ plugin __[cordova-plugin-audioinput](https://github.com/edimuj/cordova-plugin-audioinput)__

This means that you can use the library in traditional web browsers that 
__[supports getUserMedia](http://caniuse.com/#feat=stream)__, and in Apache Cordova hybrid apps together with the 
__[cordova-plugin-audioinput](https://github.com/edimuj/cordova-plugin-audioinput)__ plugin.

## Installation

Downloads:
Include any of the following sources in your project:

- [speechcapture.js](https://raw.githubusercontent.com/edimuj/speechcapture/master/src/speechcapture.js)
- [speechcapture.min.js](https://raw.githubusercontent.com/edimuj/speechcapture/master/dist/speechcapture.min.js)


## API

### start
Start the detection and capture.

```javascript
speechcapture.start(cfg, speechCapturedCB, errorCB, speechStatusCB);
```

#### speechCapturedCB (required)
Implement a callback for handling the captured speech.

```javascript
function speechCapturedCB( audioData, type ) {
	switch (type) {
		case speechcapture.AUDIO_RESULT_TYPE.WEBAUDIO_AUDIOBUFFER:
			// Do something with the captured Web Audio buffer ...
			break;

		case speechcapture.AUDIO_RESULT_TYPE.RAW_DATA:
			// Do something with the captured Float32Array ...
			break;

		case speechcapture.AUDIO_RESULT_TYPE.WAV_BLOB:
			// Do something with the captured WAV audio Blob ...
			break;

		case speechcapture.AUDIO_RESULT_TYPE.DETECTION_ONLY:
			// Do something based on the successful capture event, which in this case does not contain any audio data.
			break;

		default:
			// Unknown audio result
			break;
	}
}
```

#### errorCB (optional)
Implement a callback for handling errors.

```javascript
function errorCB( message ) {
  // Do something with the error message.
}
```

#### speechStatusCB (optional)
Implement a callback for handling status changes.

```javascript
function speechStatusCB( code ) {
  switch (code) {
        case speechcapture.STATUS.CAPTURE_STARTED:
            console.log("Capture Started!");
            break;
        case speechcapture.STATUS.CAPTURE_STOPPED:
            console.log("Capture Stopped!");
            break;
        case speechcapture.STATUS.SPEECH_STARTED:
            console.log("Speech Started!");
            break;
        case speechcapture.STATUS.ENCODING_ERROR:
            console.log("Encoding Error!");
            break;
        case speechcapture.STATUS.CAPTURE_ERROR:
            console.log("Capture Error!");
            break;
        case speechcapture.STATUS.SPEECH_ERROR:
            console.log("Speech Error!");
            break;
        case speechcapture.STATUS.SPEECH_MAX_LENGTH:
            console.log("Max Speech length!");
            break;
        case speechcapture.STATUS.SPEECH_MIN_LENGTH:
            console.log("Min Speech length!");
            break;
        case speechcapture.STATUS.SPEECH_STOPPED:
            console.log("Speech Stopped!");
            break;
        default:
            console.log("Unknown status occurred: " + code);
            break;
    }
}
```

#### Configuration

```javascript
cfg = {
  // The sample rate for captured audio results.
  // Since the sample rate of the input device not always can be changed, the library will resample the audio if needed,
  // but this requires web audio support since OfflineAudioContext is used for the resampling.
  sampleRate: 16000, // Hz
  
  // The preferred sample rate that the input device should use when capturing audio.
  // Since the sample rate cannot be changed or have additional limits on some platforms, this parameter may be ignored, 
  // so use the sampleRate parameter above to ensure that audio is resampled to the required sampleRate in your specific 
  // scenario.
  inputSampleRate: 22050, // Hz
  
  // Threshold for capturing speech.
  // The audio level must rise to at least the threshold for speech capturing to start.
  speechDetectionThreshold: 15,  // dB
  
  // The minimum length of speech to capture.
  speechDetectionMinimum: 500, // mS
  
  // The maximum length of the captured speech.
  speechDetectionMaximum: 10000, // mS
  
  // The maximum allowed delay, before speech is considered to have ended.
  speechDetectionAllowedDelay: 400, // mS
  
  // The length of the audio chunks that are analyzed.
  // Shorter gives better results, while longer gives better performance.
  analysisChunkLength: 100, // mS
  
  // Removes pauses/silence from the captured output. Will not concatenate all words aggressively, 
  // so individual words should still be identifiable in the result.
  compressPauses: false,
  
  // Do not capture any data, just speech detection events. 
  // The result audio result type is automatically set to speechcapture.AUDIO_RESULT_TYPE.DETECTION_ONLY.
  detectOnly: false,
  
  // Specifies the type of result produce when speech is captured.
  // For convenience, use the speechcapture.AUDIO_RESULT_TYPE constants to set this parameter:
  // -WAV_BLOB (1) - WAV encoded Audio blobs
  // -WEBAUDIO_AUDIOBUFFER (2) - Web Audio API AudioBuffers
  // -RAW_DATA (3) - Float32Arrays with the raw audio data, doesn't support resampling
  // -DETECTION_ONLY (4) - Used automatically when detectOnly is true
  audioResultType: speechcapture.AUDIO_RESULT_TYPE.WAV_BLOB,
  
  // Specify an existing audioContext if your application uses the Web Audio API. If no audioContext is specified,
  // the library will try to create one. The audioContext is only used if the audioResultType is set to 
  // WEBAUDIO_AUDIOBUFFER or if resampling is required (sampleRate != inputSampleRate).
  //
  audioContext: null,
  
  // Only applicable if cordova-plugin-audioinput is used as the audio source.
  // Specifies the type of the type of source audio your app requires.
  //
  // For convenience, use the audioinput.AUDIOSOURCE_TYPE constants of the audioinput plugin to set this parameter:
  // -DEFAULT (0) - The default audio source of the device.
  // -CAMCORDER (5) - Microphone audio source with same orientation as camera if available.
  // -UNPROCESSED (9) - Unprocessed sound if available.
  // -VOICE_COMMUNICATION (7) - Tuned for voice communications such as VoIP.
  // -MIC (1) - Microphone audio source. (Android only)
  // -VOICE_RECOGNITION (6) - Tuned for voice recognition if available (Android only)
  //
  // For speech detection either VOICE_COMMUNICATION (7) or VOICE_RECOGNITION (6) is preferred.
  //
  audioSourceType: audioinput.AUDIOSOURCE_TYPE.DEFAULT,
  
  // Prefer audio input using getUserMedia and use cordova-plugin-audioinput only as a fallback. Only useful if both are supported by the current platform.
  preferGUM: false,
  
  // Enable or disable the usage of the cordova-plugin-audioinput plugin even if it is available.
  audioinputPluginActive: true,
  
  // Enable or disable the usage of the getUserMedia as audio input even if it is available.
  getUserMediaActive: true,
  
  // Use window.alert and/or window.console to show errors
  debugAlerts: false, 
  debugConsole: false
}
```

##### audioResultType WEBAUDIO_AUDIOBUFFER
If the `audioResultType` is specified as `speechcapture.AUDIO_RESULT_TYPE.WEBAUDIO_AUDIOBUFFER`, an audioContext is required, which means that the browser __must have Web Audio Support__. You can either specify an __audioContext__ of your own or let the speechcapture library create one for you. The created audioContext can then be aquired using `getAudioContext`.

### stop
Stops the capturing. If speech is ongoing when stopped, a last capture output will be created as long as it is within the configuration constraints specified, when the capturing was started.

```javascript
speechcapture.stop();
```

### isCapturing
Returns a boolean with the current capturing status.

```javascript
var isCapturing = speechcapture.isCapturing();
```

### isSpeakingRightNow
Returns a boolean with the current status of speech detection.

```javascript
var isSpeaking = speechcapture.isSpeakingRightNow();
```

### getCfg
Returns an object with the current configuration.

```javascript
var currentCfg = speechcapture.getCfg();
```

### getCurrentVolume
Returns the current volume in decibel.

```javascript
var currentVolumeInDB = speechcapture.getCurrentVolume();
```

### getMonitoringData
Returns an object with useful debugging/monitoring information.

```javascript
var debugData = speechcapture.getMonitoringData();
```

### getAudioContext
If the `audioResultType` is specified as `speechcapture.AUDIO_RESULT_TYPE.WEBAUDIO_AUDIOBUFFER`, an audioContext is required, which means that the browser __must have Web Audio Support__. You can either specify an __audioContext__ of your own or let the speechcapture library create one for you. The created audioContext can then be aquired using this function.

```javascript
var audioCtx = speechcapture.getAudioContext();
```


## Example(s)
An example of how to use the speechcapture library can be found in the __demo__ folder.


## Contributing
This project is open-source, so contributions are welcome. Just ensure that your changes doesn't break backward compatibility!

1. Fork the project.
2. Create your feature branch (git checkout -b my-new-feature).
3. Commit your changes (git commit -am 'Add some feature').
4. Push to the branch (git push origin my-new-feature).
5. Create a new Pull Request.


## Todo list
[Enhancements](https://github.com/edimuj/speechcapture/labels/enhancement)


## Bugs & Questions
[Register a new issue](https://github.com/edimuj/speechcapture/issues/new)


## Donate
If you find this library useful, ensure that it is kept alive by donating:

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=R9WGMBB2BMS34)

## License
MIT
