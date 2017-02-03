/* jshint esversion: 6 */
/* jshint node: true */
/* jshint sub:true */
// This code uses ES2015 syntax that requires at least Node.js v4.
// For Node.js ES2015 support details, reference http://node.green/

"use strict";
var OpenT2T = require('opent2t').OpenT2T;
var Onboarding = require('opent2t-onboarding-org-opent2t-onboarding-wifi-wemo');

/**
* This translator class implements the "Hub" interface.
*/
class Translator {
    constructor(accessToken) {
        this._accessToken = accessToken;

        this._name = "Wemo Hub"; // TODO: Can be pulled from OpenT2T global constants. This information is not available, at least, on wink hub.
    }

    /**
     * Get the hub definition and devices
     */
    get(expand, payload, verification) {
        return this.getPlatforms(expand, payload, verification);
    }

    /**
     * Get the list of devices discovered through the hub.
     * 
     * @param {bool} expand - True to include the current state of the resources.
     * @param {Buffer} payload - POST content for a subscribed notification
     * @param {Object} verification - Information used to authenticate that the post is valid
     * @param {Array} verification.header - Header information that came with the payload POST.
     *      Should include X-Hub-Signature
     * @param {verification} verification.key - Secret key used to hash the payload (provided to Wink on subscribe)
     */
    getPlatforms(expand, payload, verification) {

        // Payload can contain one or more platforms defined using the provider schema.  This should return those platforms
        // converted to the opent2t/ocf representation.
        if (payload !== undefined) {
            // Return the verified payload 
            return this._providerSchemaToPlatformSchema(payload, expand);
        }
        else {
            // WeMo doesn't have a concept of "paired" devices, so this will discover all WeMo devices
            // on the current network
            var platforms = [];
            var onboarder = new Onboarding();
            return onboarder.discover(callback, 10000).then((devicesFound) => {
                return this._providerSchemaToPlatformSchema(devicesFound, expand);
            });
        }
    }

    _getDetails(deviceInfo) {
        // Request device information from the 
    }

    /**
     * Refreshes the OAuth token for the hub by sending a refresh POST to the wink provider
     */
    refreshAuthToken(authInfo) {
        // No auth
    }

    /**
     * Translates an array of provider schemas into an opent2t/OCF representations
     */
    _providerSchemaToPlatformSchema(providerSchemas, expand) {
        var platformPromises = [];

        // Ensure that we have an array of provider schemas, even if a single object was given.
        var wemoDevices = [].concat(providerSchemas);

        wemoDevices.forEach((wemoDevice) => {
            // get the opent2t schema and translator for the wink device
            var opent2tInfo = this._getOpent2tInfo(wemoDevice);
            
            // Do not return the physical hub device, nor any devices for which there are not translators.
            // Additionally, do not return devices that have been marked as hidden by Wink (hidden_at is a number)
            // This state is used by third party devices (such as a Nest Thermostat) that were connected to a
            // Wink account and then removed.  Wink keeps the connection, but marks them as hidden.
            if (typeof opent2tInfo !== 'undefined')
            {
                // set the opent2t info for the wink device
                var deviceInfo = {};
                deviceInfo.opent2t = {};
                deviceInfo.opent2t.controlId = this._getDeviceId(wemoDevice);
                
                // Create a translator for this device and get the platform information, possibly expanded
                platformPromises.push(OpenT2T.createTranslatorAsync(opent2tInfo.translator, {'deviceInfo': deviceInfo, 'hub': this})
                    .then((translator) => {

                        // Use get to translate the Wink formatted device that we already got in the previous request.
                        // We already have this data, so no need to make an unnecesary request over the wire.
                        return OpenT2T.invokeMethodAsync(translator, opent2tInfo.schema, 'get', [expand, winkDevice])
                            .then((platformResponse) => {
                                return platformResponse; 
                            });
                    }));
            }
        });

        // Return a promise for all platform translations.
        return Promise.all(platformPromises)
            .then((platforms) => {
                var toReturn = {};
                toReturn.schema = "org.opent2t.sample.hub.superpopular";
                toReturn.platforms = platforms;
                return toReturn;
            });
    }

    /** 
     * Given the hub specific device, returns the opent2t schema and translator
    */
    _getOpent2tInfo(wemoDevice) {
        if (wemoDevice.deviceType == "urn:Belkin:device:controllee:1") {
            return { 
                "schema": 'org.opent2t.sample.binaryswitch.superpopular',
                "translator": "opent2t-translator-com-wemo-binaryswitch"
            };
        }

        return undefined;
    }
}

module.exports = Translator;