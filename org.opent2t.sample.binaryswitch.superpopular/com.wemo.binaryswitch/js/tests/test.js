// var schema = require("c:/githome/translators/org.opent2t.sample.thermostat.superpopular/org.opent2t.sample.thermostat.superpopular");
// console.log(schema);

var test = require('ava');
var OpenT2T = require('opent2t').OpenT2T;
//var config = require('./testConfig');

//console.log("Config:");
//console.log(JSON.stringify(config, null, 2));
var translatorPath = require('path').join(__dirname, '..');

///
/// Run a series of tests to validate the translator
///

// HubResURI
test.serial('GetPlatform', t => {

    var config = {
            opent2t: {
                controlId: "uuid:Socket-1_0-221617K0102FFD"
            }
    }

    return OpenT2T.createTranslatorAsync(translatorPath, 'thingTranslator', config)
        .then(translator => {
            // TEST: translator is valid
            t.is(typeof translator, 'object') && t.truthy(translator);
            return OpenT2T.invokeMethodAsync(translator, 'org.opent2t.sample.binaryswitch.superpopular', 'getDevicesPower', ['1E840508-9E48-4459-8DD7-1D954935B482'])
                .then((power) => {
                    console.log(JSON.stringify(power, null, 2));

                    power.value = !power.value;

                    return OpenT2T.invokeMethodAsync(translator, 'org.opent2t.sample.binaryswitch.superpopular', 'postDevicesPower', ['1E840508-9E48-4459-8DD7-1D954935B482', power])
                        .then((power) => {

                        });
                });
        });
});