
var fs = require('fs');
var q = require('q');
var parseString = require('xml2js').parseString;
var _ = require('lodash');
var path = require('path');

var LocalPackageSource = require('opent2t/package/LocalPackageSource').LocalPackageSource;
var OcfSchemaReader = require('opent2t/schema/OcfSchemaReader');

/**
 * Usage
 * platformBuilder = PlatformBuilder(foo, bar);
 * platformBuilder.addDevice();
 */
class PlatformBuilder {

    /**
     * Creates a new platform corresponding to the schemaFileUri
     * 
     * platformSchemaFileUri is like "org.opent2t.sample.lamp.superpopular.json"
     */
    constructor(relativePath) {
        this.relativePath = relativePath ? relativePath : process.cwd();
    }

    setPlatformSchema(packageName) {
        console.log(packageName);
        return getSchemaModules(packageName, this.relativePath).then((modulePath) => {
            console.log(modulePath);
            let ramlFilePath = path.join(this.relativePath, modulePath + '.raml');
            return OcfSchemaReader.readThingSchemaFromFilesAsync(ramlFilePath).then((schema) => {
                cosole.log(schema);
            });
        });
    }

    /**
     * Adds a new device to this platform
     */
    addDevice() {

    }

    getPlatform(platformSchemaFileUri) {
        // Produce the final platform object
    }
}

function getSchemaModules(packageName, packageLocation) {
    var localPackageSource = new LocalPackageSource(packageLocation);
    return localPackageSource.getPackageInfoAsync(packageName).then((packageInfo) => {
        let mainSchemas = packageInfo.schemas[0];
        return mainSchemas.moduleName;
    });
}

function getSchemaNameFromManifestAsync(manifestUri) {
    l// Read the manifest.xml to parse out the main schema
    return q.nfcall(fs.readFile, manifestUri, 'utf8').then((xml) => {
        let xmlOptions = {
            mergeAttrs: true, // Prevents a bunch of $: {}
            explicitArray: false // Collapses single items
        };
        return q.nfcall(parseString, xml, xmlOptions).then((manifest) => {
            let mainSchema = _.find(manifest.manifest.schemas.schema, (schema) => {
                return schema.main === "true"; // "true" will be a string from the xml
            });
            return mainSchema.id;
        });
    });
}

// device = platform.addDevice(blah);
// device.addResource(foo);
// device.addResource(bar);

// device2 = platform.addDevice(fizz);
// device2.addResource(buzz);

// platform.getPlatform();


module.exports = PlatformBuilder;
