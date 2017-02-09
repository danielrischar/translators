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
    constructor() {
        this._name = "Wemo Hub";
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
     */
    getPlatforms(expand, payload) {

        // Payload can contain one or more platforms defined using the provider schema.  This should return those platforms
        // converted to the opent2t/ocf representation.
        if (payload !== undefined) {
            return this._providerSchemaToPlatformSchema(payload, expand);
        }
        else {
            // WeMo doesn't have a concept of "paired" devices, so this will discover all WeMo devices
            // on the current network
            return Onboarding.discover(3000).then((devicesFound) => {
                // devices found contain the raw data from Wemo which can be translated
                var rawDevices = [];
                devicesFound.forEach( (device) => {
                    rawDevices.push(device.raw);
                });
                return this._providerSchemaToPlatformSchema(rawDevices, expand);
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
    _providerSchemaToPlatformSchema(rawProviderSchemas, expand) {
        var platformPromises = [];

        // Ensure that we have an array of provider schemas, even if a single object was given.
        var rawWemoDevices = [].concat(rawProviderSchemas);

        rawWemoDevices.forEach((rawWemoDevice) => {
            // get the opent2t schema and translator for the wemo device
            var opent2tInfo = this._getOpent2tInfo(rawWemoDevice.deviceType);
            
            if (typeof opent2tInfo !== 'undefined')
            {
                // set the opent2t info for the wemo device
                var deviceInfo = {};
                deviceInfo.opent2t = opent2tInfo;
                deviceInfo.opent2t.controlId = rawWemoDevice.UDN;

                // Create a translator for this device and get the platform information, possibly expanded
                platformPromises.push(OpenT2T.createTranslatorAsync(opent2tInfo.translator, {'deviceInfo': deviceInfo, 'hub': this})
                    .then((translator) => {
                        return OpenT2T.invokeMethodAsync(translator, opent2tInfo.schema, 'get', [expand])
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
    _getOpent2tInfo(deviceType) {
        if (deviceType == "urn:Belkin:device:controllee:1") {
            return { 
                "schema": 'org.opent2t.sample.binaryswitch.superpopular',
                "translator": "opent2t-translator-com-wemo-binaryswitch"
            };
        }

        return undefined;
    }
}

module.exports = Translator;