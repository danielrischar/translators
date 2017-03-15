
var OpenT2TError = require('opent2t').OpenT2TError;

var $RefParser = require('json-schema-ref-parser');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var q = require('q');

//var OpenT2TSchemas = require('opent2t-schemas');

var translatorRootDir;

// Cache to hold already search contents so the file doesn't need to be read again.
var schemaCache = {};

class DeviceBuilder {
    constructor(root) {
        translatorRootDir = root;
    }

    // /**
    //  * resourceName corresponds to the name in the org.opent2t.*.superpopular.json (or whichever) file
    //  */
    // addResource(resourceName, resourceValues) {
    //     // Look up the property name
        
    //     // Copy the 
    // }

    // getDefaultResource(resourceName) {
    //     // Look up the property name
    //     if (this.properties.hasOwnProperty(resourceName)) {
    //         this.properties[resourceName].default
    //     }
    // }
/**
 * Adds a 
 */
    addResource2(resourceType, resourceValues) {
        console.log(`Adding ${resourceType}`);
        // TODO: where do I get interfaces from? They exist in the RAML, but I don't want to parse that

        return getSchemaProperties(resourceType, this.schemaFileResolver).then((properties) => {
            // _.forOwn(properties, (value, key) => {
            //     console.log(`${key}:\t${value.required}`);
            // });
        });
    }

    getDevice() {
        // return the built device
    }

    /**
     * Finds schema files using a known directory structure
     */
    schemaFileResolver(resourceSchemaType, relativeUri) {
        var deferred = q.defer();

        console.log(`${resourceSchemaType} - looking for ${relativeUri}`);

        // Find the file
        let filePath = path.join(translatorRootDir, path.basename(relativeUri, '.json'), relativeUri);

        if (schemaCache[resourceSchemaType] !== undefined) {
            console.log("using cached schema");
            deferred.resolve(content);
        } else {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    var jsonData = JSON.parse(data);
                    // Special case, all oic.core properties are required by OpenT2T even if not marked
                    // as such elsewhere.
                    // if (resourceSchemaType === 'oic.core') {
                    //     _.forOwn(jsonData.definitions[resourceSchemaType].properties, (value, key) => {
                    //         value.required = true;
                    //     });
                    // }

                    schemaCache[resourceSchemaType] = jsonData;
                    
                    deferred.resolve(jsonData);
                }
            });
        }

        return deferred.promise;
    }
}

/**
 * Parse a JSON schema, dereferencing where required, and produce a list of all prperties that can exist constructor
 * the resource, marking required ones as appropriate.
 */
function getSchemaProperties(resourceSchemaType, fileResolver) {
    const fileResolverAdapter = {
        canRead: /\.json$/i,
        read: function(file) {
            let relativeUri = path.relative(process.cwd(), file.url);
            return fileResolver(path.basename(file.url, file.extension), relativeUri);
        },
    };

    let options = {
        dereference: {
            circular: "ignore"
        },
        resolve: {
            file: fileResolverAdapter,
            http: false
        }
    }

    return fileResolver(resourceSchemaType, resourceSchemaType + ".json").then((schema) => {
        return $RefParser.dereference(schema, options).then((dereferencedSchema) => {
            var required = dereferencedSchema.required;
            var  properties = dereferencedSchema.definitions[resourceSchemaType].properties;

            // Go through each reference to get possible properties
            // _.forEach(dereferencedSchema.allOf, (ref) => {
            //     Object.assign(properties, ref.properties);
            // });

            // TODO: doesn't pick up requireds from reffed json, even though it lists the properties just fine
            // _.forOwn(properties, (value, key) => {
            //     value.required = value.required || required.indexOf(key) > -1;
            // });

            console.log("dereferenced schema: " + JSON.stringify(dereferencedSchema, null, 2));
            return dereferencedSchema;
        });
    });
}

module.exports = DeviceBuilder;