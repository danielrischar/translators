# OpenT2T Translator Generators
Provides Platform, Device, and Resource generation for OpenT2T in order to simplify translators and reduce missing or non-conforming translator output.

1. Read the schemas for the translator from manifest.xml (whichever one has main=true)
2. Find that resource definition (in packages and in the repo it will be (cwd)../../<schema>.json)
3. Dereference that json
    The schema should just be self referential
4. Create a skeleton Platform, and keep track of what devices (anyOf) can be attached
5. Allow creation of devices (as long as they are anyOf'ed)
    When creating a device, set resource values on require/optional resources