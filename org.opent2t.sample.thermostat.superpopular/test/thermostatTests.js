'use strict';

var OpenT2T = require('opent2t').OpenT2T;
var helpers = require('opent2t-testcase-helpers');
var translator = undefined;
const SchemaName = 'org.opent2t.sample.thermostat.superpopular';

function runThermostatTests(settings) {
    var test = settings.test;
    var deviceId = settings.deviceId;

    function verifyTemperatureData(t, response) {
        t.is(response.rt[0], 'oic.r.temperature');
        t.is(typeof(response.temperature),  'number', 'Verify temperature is a number');
        t.is(typeof(response.units), 'string', 'Verify units is a string, actual: ' + typeof(response.units));
    }

    test.before(() => {
        return settings.createTranslator().then(trans => {
            translator = trans;
			return OpenT2T.invokeMethodAsync(translator, SchemaName, 'get', []).then((response) => {
                if(deviceId === undefined) {
                    deviceId = response.entities[0].di;
                }
			});
        });
    });

    test.serial('Valid Thermostat Translator', t => {
        t.is(typeof translator, 'object') && t.truthy(translator);
    });

    test.serial('GetPlatform', t => {
        return OpenT2T.invokeMethodAsync(translator, SchemaName, 'get', []).then((response) => {
            t.is(response.rt[0], SchemaName);
            
            var resource = response.entities[0].resources[0];
            t.is(resource.href, '/ambientTemperature');
            t.is(resource.rt[0], 'oic.r.temperature');
            t.true(resource.temperature === undefined);
        });
    });

    test.serial('GetPlatformExpanded', t => {
        return OpenT2T.invokeMethodAsync(translator, SchemaName, 'get', [true])
            .then((response) => {
                t.is(response.rt[0], SchemaName);

                var resource = response.entities[0].resources[0];
                t.is(resource.id, 'ambientTemperature');
                t.is(resource.rt[0], 'oic.r.temperature');
                t.true(resource.temperature !== undefined);
        });
    });

    test.serial('GetAmbientTemperature', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesAmbientTemperature', [deviceId]).then((response) => {
                verifyTemperatureData(t, response);
            });
        });
    });

    test.serial('GetTargetTemperature', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesTargetTemperature', [deviceId]).then((response) => {
                verifyTemperatureData(t, response);
            });
        });
    });

    test.serial('SetTargetTemperature', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesTargetTemperature', [deviceId]).then((initialTemperature) => {
                return OpenT2T.invokeMethodAsync(translator, SchemaName, 'postDevicesTargetTemperature', [deviceId, { 'temperature': 30, 'units': 'c' }]).then(() => {
                    return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesTargetTemperature', [deviceId]).then((targetTemperature) => {
                        t.not(targetTemperature.temperature, initialTemperature.temperature)
                        t.truthy(Math.abs(targetTemperature.temperature - 30) < 0.75);
                    });
                });
            });
        });
    });

    test.serial('GetHumidity', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesHumidity', [deviceId]).then((response) => {
                t.is(response.rt[0], 'oic.r.humidity');
                t.is(typeof(response.humidity), 'number', 'Verify humidity is a number, actual: ' + typeof(response.humidity));
            });
        });
    });

    test.serial('GetTargetTemperatureHigh', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesTargetTemperatureHigh', [deviceId]).then((response) => {
                verifyTemperatureData(t, response);
            });
        });
    });

    test.serial('SetTargetTemperatureHigh', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesTargetTemperatureHigh', [deviceId]).then((initialTemperature) => {
                return OpenT2T.invokeMethodAsync(translator, SchemaName, 'postDevicesTargetTemperatureHigh', [deviceId, { 'temperature': 7, 'units': 'c' }]).then(() => {
                    return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesTargetTemperatureHigh', [deviceId]).then((targetTemperature) => {
                        t.not(targetTemperature.temperature, initialTemperature.temperature)
                        t.truthy(Math.abs(targetTemperature.temperature - 7) < 0.75);
                    });
                });
            });
        });
    });

    test.serial('GetTargetTemperatureLow', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesTargetTemperatureLow', [deviceId]).then((response) => {
                verifyTemperatureData(t, response);
            });
        });
    });

    test.serial('SetTargetTemperatureLow', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesTargetTemperatureLow', [deviceId]).then((initialTemperature) => {
                return OpenT2T.invokeMethodAsync(translator, SchemaName, 'postDevicesTargetTemperatureLow', [deviceId, { 'temperature': 19, 'units': 'c' }]).then(() => {
                    return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesTargetTemperatureLow', [deviceId]).then((targetTemperature) => {
                        t.not(targetTemperature.temperature, initialTemperature.temperature)
                        t.truthy(Math.abs(targetTemperature.temperature - 19) < 0.75);
                    });
                });
            });
        });
    });

    test.serial('GetAwayTemperatureHigh', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesAwayTemperatureHigh', [deviceId]).then((response) => {
                verifyTemperatureData(t, response);
            });
        });
    });

    test.serial('SetAwayTemperatureHigh', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesAwayTemperatureHigh', [deviceId]).then((initialTemperature) => {
                return OpenT2T.invokeMethodAsync(translator, SchemaName, 'postDevicesAwayTemperatureHigh', [deviceId, { 'temperature': 22, 'units': 'c' }]).then(() => {
                    return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesAwayTemperatureHigh', [deviceId]).then((targetTemperature) => {
                        t.not(targetTemperature.temperature, initialTemperature.temperature)
                        t.truthy(Math.abs(targetTemperature.temperature - 22) < 0.75);
                    });
                });
            });
        });
    });

    test.serial('GetAwayTemperatureLow', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesAwayTemperatureLow', [deviceId]).then((response) => {
                verifyTemperatureData(t, response);
            });
        });
    });

    test.serial('SetAwayTemperatureLow', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesAwayTemperatureLow', [deviceId]).then((initialTemperature) => {
                return OpenT2T.invokeMethodAsync(translator, SchemaName, 'postDevicesAwayTemperatureLow', [deviceId, { 'temperature': 19, 'units': 'c' }]).then(() => {
                    return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesAwayTemperatureLow', [deviceId]).then((targetTemperature) => {
                        t.not(targetTemperature.temperature, initialTemperature.temperature)
                        t.truthy(Math.abs(targetTemperature.temperature - 19) < 0.75);
                    });
                });
            });
        });
    });

    test.serial('GetAwayMode', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesAwayMode', [deviceId]).then((response) => {
                helpers.verifyModesData(t, response);
            });
        });
    });

    test.serial('SetAwayMode', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'postDevicesAwayMode', [deviceId, {'modes': ['away']}]).then((response) => {
                helpers.verifyModesData(t, response);
            });
        });
    });

    test.serial('GetEcoMode', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesEcoMode', [deviceId]).then((response) => {
                t.is(response.rt[0], 'oic.r.sensor');
                t.truthy(typeof(response.value) === 'boolean', 'Verify eco mode value is a boolean');
            });
        });
    });

    test.serial('GetHvacMode', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesHvacMode', [deviceId]).then((response) => {
                helpers.verifyModesData(t, response);
            });
        });
    });

    test.serial('SetHvacMode', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'postDevicesHvacMode', [deviceId, {'modes': ['auto']}]).then((response) => {
                helpers.verifyModesData(t, response);
            });
        });
    });

    test.serial('GetHeatingFuelSource', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesHeatingFuelSource', [deviceId]).then((response) => {
                t.is(response.rt[0], 'opent2t.r.heatingFuel');
                t.truthy(typeof(response.fuelType) === 'string', 'Verify fuelType is a boolean');
            });
        });
    });

    test.serial('GetHasFan', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesHasFan', [deviceId]).then((response) => {
                t.is(response.rt[0], 'oic.r.sensor');
                t.truthy(typeof(response.value) === 'boolean', 'Verify eco mode value is a boolean');
            });
        });
    });

    test.serial('GetFanActive', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesFanActive', [deviceId]).then((response) => {
                t.is(response.rt[0], 'oic.r.sensor');
                t.truthy(typeof(response.value) === 'boolean', 'Verify eco mode value is a boolean');
            });
        });
    });

    test.serial('GetFanTimerActive', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesFanTimerActive', [deviceId]).then((response) => {
                t.is(response.rt[0], 'oic.r.sensor');
                t.truthy(typeof(response.value) === 'boolean', 'Verify eco mode value is a boolean');
            });
        });
    });

    test.serial('GetFanTimerTimeout', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesFanTimerTimeout', [deviceId]).then((response) => {
                t.is(response.rt[0], 'oic.r.clock');
                t.truthy(typeof(response.datetime) === 'string', 'Verify datetime is a string');
            });
        });
    });

    test.serial('SetFanTimerTimeout', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'postDevicesFanTimerTimeout', [deviceId, {'datetime': '2016-03-15T14:30Z'}]).then((response) => {
                t.is(response.rt[0], 'oic.r.clock');
            });
        });
    });

    test.serial('GetFanMode', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesFanMode', [deviceId]).then((response) => {
                helpers.verifyModesData(t, response);
            });
        });
    });

    test.serial('SetFanMode', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'postDevicesFanMode', [deviceId, {'modes': ['auto']}]).then((response) => {
                helpers.verifyModesData(t, response);
            });
        });
    });

    test.serial('GetTargetTemperatureForNonexistentDevice_Fails', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'getDevicesTargetTemperature', ['00000000-0000-0000-0000-000000000000']);
        });
    });

    test.serial('SetAwayModeForNonexistentDevice_Fails', t => {
        return helpers.runTest(settings, t, () => {
            return OpenT2T.invokeMethodAsync(translator, SchemaName, 'postDevicesAwayMode', ['00000000-0000-0000-0000-000000000000', {'modes': ['away']}]);
        });
    });
}

module.exports = runThermostatTests;