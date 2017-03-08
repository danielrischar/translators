# Colour Resources in Opent2t
 
## Introduction
The translator schemas for bulbs can include 3 optional, related resources:
* colourMode
* colourRGB
* colourChroma
 
These resources reflect both the provider's default color representation, as well as the colors that will be supported by OpenT2T when getting and setting the resources.
 
Different providers support various colour modes.  Without going into too much detail on the modes themselves, between the colourChroma and colourRGB resources 4 different "modes" can be supported.
* RGB (red, green, blue channels)
* hue, saturation (coupled with value/level/brightness)
* csc ([X,Y] coordinates, coupled with brightness)
* ct (colour temperature, in Mired units *not Kelvin*)

Which values, on which resources will be valid is provided by the read only (oic.if.s) colourMode resource.

## colourMode
The colourMode resource is a sensor (oic.if.s) and will only have a get method.  These modes are decided on by the provider and the translator as the best ways of representing colour in the bulb.
```javascript
{
    "id": "colourMode",
    "href": "/colourMode",
    "rt": ["oic.r.mode"],
    "if": ["oic.if.s", "oic.if.baseline"],
    "modes": [],
    "supportedModes": [],
}
```

### modes
The modes property on the resource lists the modes that are used by the provider by default (not translated betwen colour representations), selected from the list ['rgb', 'xy', 'hsv', 'ct'].

### supportedModes
The supportedModes property on the resource is the modes that can be used for get/set on the colour properties.  This should be a superset of the modes that are supported as many translators will chose to offer an RGB option converting from hue/saturation and xy/csc.
 
For example, the colourMode of a light bulb that supports only hue and saturation at the provider level can have a colourMode resource as follows:
```js
{
    "id": "colourMode",
    "href": "/colourMode",
    "rt": ["oic.r.mode"],
    "if": ["oic.if.s", "oic.if.baseline"],
    "modes": ['hsv'],
    "supportedModes": ['hsv', 'rgb'],
}
```
In this case, the provider's preferred (no translation) chromaticity is given in modes as [hsv].  Listing 'rgb' in supported modes signifies that the colourRGB resource will also be available, and the translator offers conversion from HSV to RGB and back.
 
In this way, different colour modes can always be supported via translation, but an opent2t consumer can still choose the most accurate way of representing a colour if they desire, and bulb manufacturer's can still achieve the colour accuracy that they expect.
 
Translators should strive to provide additional modes through conversion whenever possible to ensure that consumers of OpenT2T can do a minimal amount of work in order to support all devices.  At a minimum, hsv and xy should be converted to rgb, but preferably all modes can be offered by all bulbs if accurate colour conversion is possible.

If a provider supports multiple modes already (eg returning rgb and hsv), then both should be listed in modes, and the translator will not have to perform any conversion.

## colourRGB and colourChroma
The modes above are split between two colour resources.

### colourRGB
colourRGB contains the red. green, and blue channel value for a color.
```js
{
    "id": "colourRGB",
    "href": "/colourRGB",
    "rt": ["oic.r.colour.rgb"],
    "if": ["oic.if.a", "oic.if.baseline"],
    "rgbValue": [255, 255, 255],
    "range": [0, 255]
}
```
### colourChroma
The colourChroma resource can describe the colour properties in 3 different ways:
* hue & saturation
* csc (xy)
* ct (colour temperature) by itself

Properties that cannot be used by the translator should not be present.

```js
{
    "id": "colourChroma",
    "href": "/colourChroma",
    "rt": ["oic.r.colour.chroma"],
    "if": ["oic.if.a", "oic.if.baseline"],
    "hue": 100,
    "saturation": 100,
    "csc": [0.123, 0.123],
    "ct": 134
}
```

## Colour Temperature (ct)
Colour temperature defines the colour of a "white" bulb, from the low end (cool, blue-ish) to the high end (warm, yellow-ish).  Colour temperature is measured in Kelvin, or Mired with a conversion of
```
mired = 1 million / Kelvin
```
Colour temperature in oic.r.colourChroma needs to always be in Mired, though most providers with return it in Kelvin.

## Examples
The following are some examples of bulbs that support various colour combinations:

### White Bulb
colourMode, colourRGB, and colourChroma will not be available.

### White Bulb with Colour Temperature
A bulb that only supports colour temperature will have resources as follows (note that ct is in Mired, the equivalent of 6000K)
```js
{
    "id": "colourMode",
    "href": "/colourMode",
    "rt": ["oic.r.mode"],
    "if": ["oic.if.s", "oic.if.baseline"],
    "modes": ['ct'],
    "supportedModes": ['ct'],
},
{
    "id": "colourChroma",
    "href": "/colourChroma",
    "rt": ["oic.r.colourChroma"],
    "if": ["oic.if.a", "oic.if.baseline"],
    "ct": 167
}
```

### Bulb supporting hue and saturation
If hue and saturation are provider, the translator should also offer RGB conversion.  Only the hue and saturation properties on the colourChroma resource should be set.  For the level/brightness/value, the dim resources is used.  The translator will need to convert from hsv to RGB and back again.
```js
{
    "id": "colourMode",
    "href": "/colourMode",
    "rt": ["oic.r.mode"],
    "if": ["oic.if.s", "oic.if.baseline"],
    "modes": ['hsv'],
    "supportedModes": ['hsv', 'rgb'],
},
{
    "id": "dim",
    "href": "/dim",
    "rt": ["oic.r.dimming"],
    "if": ["oic.if.a", "oic.if.baseline"],
    "dimmingSetting": 80,
    "range": [0, 100]
},
{
    "id": "colourChroma",
    "href": "/colourChroma",
    "rt": ["oic.r.colourChroma"],
    "if": ["oic.if.a", "oic.if.baseline"],
    "hue": 273,
    "saturation": 84
},
{
    "id": "colourRGB",
    "href": "/colourRGB",
    "rt": ["oic.r.colourRGB"],
    "if": ["oic.if.a", "oic.if.baseline"],
    "rgbvalue": [124, 32, 200],
    "range": [0, 255]
}
```

### Bulb Supporting XY/Colour Space Coordinates
This would be the same as the previous example, except that only the csc value on the colourChroma would be valid, unless the provider also wants to provide conversion to and from hue/saturation.

### Bulb that offers only RGB
```js
{
    "id": "colourMode",
    "href": "/colourMode",
    "rt": ["oic.r.mode"],
    "if": ["oic.if.s", "oic.if.baseline"],
    "modes": ['rgb'],
    "supportedModes": ['rgb', 'rgb'],
},
{
    "id": "colourRGB",
    "href": "/colourRGB",
    "rt": ["oic.r.colourRGB"],
    "if": ["oic.if.a", "oic.if.baseline"],
    "rgbvalue": [124, 32, 200],
    "range": [0, 255]
}
```