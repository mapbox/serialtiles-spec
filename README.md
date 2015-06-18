## What is inside of a serialtile

Great illustration by @rclark that describes what a serialtile is made up of:

#### PBF (vector tile data) 
*NOTE: emphasis on `gzipped tile data`*. So the pbf/tile data is gzipped, THEN base-64-encoded.
```
g +-- JSONBREAKFASTTIME
z |   {"tilejson":"info object"}
i |   {"z":0,"x":0,"y":0,"buffer":"base64-encoded, gzipped tile data"}
p |   {"z":1,"x":0,"y":0,"buffer":"base64-encoded, gzipped tile data"}
p |   {"z":1,"x":1,"y":0,"buffer":"base64-encoded, gzipped tile data"}
e |   {"z":1,"x":0,"y":1,"buffer":"base64-encoded, gzipped tile data"}
d +-- {"z":1,"x":1,"y":1,"buffer":"base64-encoded, gzipped tile data"}
```

#### Other data supported by [tiletype](https://github.com/mapbox/tiletype/blob/master/index.js#L6-L29) (png, webp, gif, jpg)
*NOTE: Non-PBF data is NOT gzipped*. It is only base-64 encoded.
```
g +-- JSONBREAKFASTTIME
z |   {"tilejson":"info object"}
i |   {"z":0,"x":0,"y":0,"buffer":"base64-encoded data"}
p |   {"z":1,"x":0,"y":0,"buffer":"base64-encoded data"}
p |   {"z":1,"x":1,"y":0,"buffer":"base64-encoded data"}
e |   {"z":1,"x":0,"y":1,"buffer":"base64-encoded data"}
d +-- {"z":1,"x":1,"y":1,"buffer":"base64-encoded data"}
```

Another [helpful gist](https://gist.github.com/rclark/a27d875ba03f9941fb01) by @rclark

_____________
Per chat with @rclark, here is a script that creates serialtiles for you:

```
#!/usr/bin/env node

var zlib = require('zlib');
var fs = require('fs');
var inputFilePath = process.argv[2];

fs.readFile(inputFilePath, function(err, dataBuffer) {
  if (err) throw err;
  
  var tilejson = {tilejson:'style info object'};
  var outputFilePath = inputFilePath + '.gz';
  var dataType = 'png';
  var z = 1;
  var x = 0;
  var y = 0;

  makeBreakfast(z, x, y, JSON.stringify(tilejson), dataType, dataBuffer, outputFilePath, function(err) {
    if (err) throw err;
    else console.log("Success!");
  });
}); 

 
function makeBreakfast(z, x, y, tilejson, dataType, data, outputFilePath, callback) {
  var validTypes = ['png', 'jpg', 'webp', 'gif', 'pbf'];
  if (validTypes.indexOf(dataType) === -1) 
    return callback(new Error('You have to provide the right kind of data'));
  
  if (!Buffer.isBuffer(data)) 
    return callback(new Error('You have to provide your data as a binary buffer'));
  
  var oneTile = {
    z: z,
    x: x,
    y: y,
    buffer: ''
  };
  
  if (dataType === 'pbf') return zlib.gzip(data, encode);
  else encode(null, data);
  
  function encode(err, data) {
    oneTile.buffer = data.toString('base64');
    
    var outputFile = fs.createWriteStream(outputFilePath);
    var gzipStream = zlib.createGzip();
    gzipStream.pipe(outputFile);
    
    outputFile.on('finish', function() {
      callback(null, outputFilePath);
    });
    
    gzipStream.write('JSONBREAKFASTTIME\n');
    gzipStream.write(JSON.stringify(tilejson) + '\n');
    gzipStream.write(JSON.stringify(oneTile) + '\n');
    gzipStream.end();
  }
}
```

### How to use

Run `node make_cereal.js <filepath>`
