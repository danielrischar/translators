var DeviceBuilder = require('./deviceBuilder');
var PlatformBuilder = require('./platformBuilder');
var path = require('path');

var resourcePath = path.join(process.cwd(), '../../../');

var platformBuilder = new PlatformBuilder('./node_modules/opent2t-translator-com-wink-lightbulb/');

//var manifestUri = '../../../org.opent2t.sample.lamp.superpopular/com.wink.lightbulb/js/manifest.xml';
platformBuilder.setPlatformSchema('opent2t-translator-com-wink-lightbulb').then(() => {

}).catch((err)=>{
    console.log(err);
});