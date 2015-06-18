#!/usr/bin/env node

/**
 * Usage:
 * Run `node make_cereal.js <filepath>`
 */

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
