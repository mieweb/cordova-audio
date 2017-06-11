cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-plugin-audioinput.AudioInput",
        "file": "plugins/cordova-plugin-audioinput/www/audioInputCapture.js",
        "pluginId": "cordova-plugin-audioinput",
        "clobbers": [
            "audioinput"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-compat": "1.1.0",
    "cordova-plugin-audioinput": "0.3.0",
    "cordova-plugin-whitelist": "1.3.2"
};
// BOTTOM OF METADATA
});