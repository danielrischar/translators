'use strict';

var q = require('q');
var wemoClient = require('wemo-client');
var url = require('url');

function validateArgumentType(arg, argName, expectedType) {
    if (typeof arg === 'undefined') {
        throw new Error('Missing argument: ' + argName + '. ' +
            'Expected type: ' + expectedType + '.');
    } else if (typeof arg !== expectedType) {
        throw new Error('Invalid argument: ' + argName + '. ' +
            'Expected type: ' + expectedType + ', got: ' + (typeof arg));
    }
}

/**
 * Helper method to convert the provider schema to the platform schema.
 */ 
function providerSchemaToPlatformSchema(providerState, deviceInfo, expand) {
    var powered = (providerState == 0) ? false : true;
    
    var power = {
        href: '/power',
        rt: ['oic.r.switch.binary'],
        if: ['oic.if.a', 'oic.if.baseline']
    };

    if (expand) {
        power.id = 'power';
        power.value = powered;
    }

    return {
        opent2t: {
            schema: 'org.opent2t.sample.binaryswitch.superpopular',
            translator: 'opent2t-translator-com-wemo-binaryswitch',
            controlId: deviceInfo.UDN
        },
        pi: deviceInfo.UDN,
        mnmn: deviceInfo.manufacturer,
        mnmo: deviceInfo.modelDescription,
        n: deviceInfo.friendlyName,
        rt: ['org.opent2t.sample.binaryswitch.superpopular'],
        entities: [
            {
                rt: ['oic.d.smartplug'],
                di: wemoSwitchDi,
                resources: [
                    power
                ]
            }
        ]
    };
}

 /**
  * Helper to find a resource/entity combo in a platform
  */
function findResource(schema, di, resourceId) {
    var entity = schema.entities.find((d) => {
        return d.di === di;
    });

    var resource = entity.resources.find((r) => {
        return r.id === resourceId;
    });

    return resource;
}

/**
 * Discovers the address etc. for a device given a UUID if
 * it is not already cached.
 */
function getDevice(uuid) {
    console.log("starting discovery for: " + uuid);
    var deferred = q.defer();
    
    if (wemoDeviceInfoCache) {
        deferred.resolve(wemoDeviceInfoCache);
    }

    wemo.discover( (deviceInfo) => {
        if (deviceInfo.UDN === uuid) {
            console.log("found the device " + uuid);
            wemoDeviceInfoCache = deviceInfo;
            deferred.resolve(deviceInfo);
        }

        // Cancel discovery and timeout if the device isn't found quickly
        setTimeout( () => {
            deferred.reject("Could not find WeMo device");
        }, 3000);
    });

    return deferred.promise;
}

// Each device in the platform has its own static identifier
const wemoSwitchDi = '1E840508-9E48-4459-8DD7-1D954935B482';

var wemo = new wemoClient();
var wemoDeviceInfoCache;

/**
 * This translator class implements the 'org.opent2t.sample.binaryswitch.superpopular' interface.
 *  */ 
class Translator {
    
    constructor(deviceInfo) {
        validateArgumentType(deviceInfo, "deviceInfo", "object");
        
        console.log("Initializing WeMo binary switch for " + deviceInfo.deviceInfo.opent2t.controlId);
        this.deviceInfo = deviceInfo.deviceInfo;

        // deviceInfo : {
        //     opent2t: {
        //         controlId: "uuid"
        //     }
        // }

        // The deviceInfo contains the UUID for this device, as the address can changes
        // the device needs to be re-discovered to get the address prior to first use.
        // This is a quick process (SSDP discovery of a uPnP device) but the constructor isn'to
        // the appropriate place for it.  Instead, do the discovery lazily the first time it is needed.
    }

    /**
     *  Queries the entire state of the binary switch 
     * and returns an object that maps to the json schema org.opent2t.sample.binaryswitch.superpopular
     */
    get(expand, payload) {
        if (payload) {
            return  providerSchemaToPlatformSchema(payload, this.deviceInfo, expand);
        }
        else {
            return getDevice(this.deviceInfo.opent2t.controlId).then( (deviceInfo) => {
                var deferred = q.defer();
                var client = wemo.client(deviceInfo);
                client.getBinaryState((err, state) => {
                    if (!err && state) {
                        deferred.resolve(providerSchemaToPlatformSchema(state, this.deviceInfo, expand));
                    } else {
                        deferred.reject(err);
                    }
                });
                return deferred.promise;
            });   
        }
    }

    /** 
     * Get the power resource from the binary switch
     */
    getDevicesPower(di) {
        return this.getDeviceResource(di, 'power');
    }

    /** 
     * Post the power resource to the binary switch
     */
    postDevicesPower(di, payload) {
        return this.postDeviceResource(di, 'power', payload);
    }

    /** 
     * Subscribe to state changes to the binary switch 
     * */
    postSubscribe(subscriptionInfo) {
        throw new Error("Not implemented");
    }

    /**
     *  Unsubscribe from state changes to the binary switch
     */
    deleteSubscribe(subscriptionInfo) {
        throw new Error("Not implemented");
    }

    /**
     * Get an OCF resource
     */
    getDeviceResource(di, resourceId) {
        return this.get(true)
            .then(response => {
                return findResource(response, di, resourceId);
            });
    }

    /**
     * Post an OCF resource
     */
    postDeviceResource(di, resourceId, payload) {
        if (di === wemoSwitchDi) {
            var deferred = q.defer();

            if (resourceId == 'power') {
                var state = payload.value ? 1 : 0;
                return getDevice(this.deviceInfo.opent2t.controlId).then( (deviceInfo) => {
                    var client = wemo.client(deviceInfo);
                    client.setBinaryState(state, (err, stat) => {
                        if (!err  && state != undefined) {
                            // Convert the new state back to OCF
                            var schema = providerSchemaToPlatformSchema(state, this.deviceInfo, true);
                            deferred.resolve(findResource(schema, di, resourceId));
                        } else {
                            deferred.reject(err);
                        }
                    });

                    return deferred.promise;
                }); 
            }
        }
    }
}

// Export the translator from the module.
module.exports = Translator;
