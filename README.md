# serialtiles-spec

**serialtiles** is a specification for _streaming tile uploads_. This format
makes it possible to transfer large tilesets from [MBTiles](https://github.com/mapbox/mbtiles-spec)
or other sources in a streaming manner: this allows both the sender
and receiver to process the upload without holding the entire thing in memory
or waiting for completion.

Unlike MBTiles, serialtiles is a text format, not a binary format: it is a
transmission of [line-delimited JSON](https://en.wikipedia.org/wiki/Line_Delimited_JSON).
Binary contents of tiles, like raster images and protocol buffer-encoded
vectors, are [base64](https://en.wikipedia.org/wiki/Base64) encoded in
order to be safe for this transport.

## Requirements Language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this
document are to be interpreted as described in [RFC2119].

## Definitions

JavaScript Object Notation (JSON), and the terms object, name, value, array,
number, true, false, and null are to be interpreted as defined in [RFC7159].

## Specification

serialtiles is a stream and thus is documented in order that it appears. Any
other order is invalid. serialtiles is a subset of [line-delimited JSON](https://en.wikipedia.org/wiki/Line_Delimited_JSON):
each item is separated by a linebreak.

### Header

The stream MUST begin with the literal text

    JSONBREAKFASTTIME

This header declares that the stream contains serialtiles data.

### TileJSON

The second item in the stream MUST be a valid [TileJSON](https://github.com/mapbox/tilejson-spec)
object, stringified and wrapped in a JSON object under the member `tilejson`.

```json
{"tilejson":"STRINGIFIED TILEJSON CONTENT"}
```

### Tiles

Each tile is a JSON object that contains `z`, `x`, `y`, and `buffer` members.
The `z` `x` and `y` members represent a Z/X/Y tile in the [slippy map tilenames](http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)
scheme, in the Web Mercator map projection.

The `buffer` member contains tile data. The encoding of map data is as such:

* Raster data, including PNG, JPEG, GIF, WebP is **base64 encoded**
* Protocol buffer data, including [Mapbox Vector Tiles](https://www.mapbox.com/developers/vector-tiles/),
  is **gzip compressed** and then **base64 encoded**.

```json
{"z":10,"x":1,"y":2,"buffer":""}
```

## Examples

#### Vector Tiles (vector tile data)

Serialtiles is often used to transfer [Mapbox Vector Tiles](https://www.mapbox.com/developers/vector-tiles/),
which are [protocol buffer](https://github.com/google/protobuf)-encoded. These
tiles are additionally required to be gzipped & base64-encoded for transmission
through serialtiles because serialtiles is not a binary format.

```json
JSONBREAKFASTTIME
{"tilejson":"info object"}
{"z":0,"x":0,"y":0,"buffer":"base64-encoded, gzipped tile data"}
{"z":1,"x":0,"y":0,"buffer":"base64-encoded, gzipped tile data"}
{"z":1,"x":1,"y":0,"buffer":"base64-encoded, gzipped tile data"}
{"z":1,"x":0,"y":1,"buffer":"base64-encoded, gzipped tile data"}
{"z":1,"x":1,"y":1,"buffer":"base64-encoded, gzipped tile data"}
```

#### Raster Images (png, webp, gif, jpg)

Unlike vector tiles, raster images are _not gzipped_: they are only
base64 encoded.

```json
JSONBREAKFASTTIME
{"tilejson":"info object"}
{"z":0,"x":0,"y":0,"buffer":"base64-encoded data"}
{"z":1,"x":0,"y":0,"buffer":"base64-encoded data"}
{"z":1,"x":1,"y":0,"buffer":"base64-encoded data"}
{"z":1,"x":0,"y":1,"buffer":"base64-encoded data"}
{"z":1,"x":1,"y":1,"buffer":"base64-encoded data"}
```

## Examples

* [make_cereal](examples/make_cereal.js): example of generating serialtiles
  from node.js

## Implementations

An unofficial list of implementations is
maintained [in the wiki of the serialtiles-spec GitHub project](https://github.com/mapbox/serialtiles-spec/wiki/Implementations)
