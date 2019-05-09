With areacompare you can compare two different areas simultaneity with two openstreetmaps.
Adapted from [Map Compare](http://tools.geofabrik.de/mc/)

[Demo](http://klml.github.com/areacompare/)

## Usage

You can use the normal OSM controls. Some more features

* The 'desync' button, on the right-top corner is to change one map seperatly.
* with 'rysnc' you get the simultaneity back. To get the simultaneity zoom, just drag the desired map.


ATM no support for IE;(

## Links

You can use these GET parameters (same as in www.openstreetmap.org/?lat=1.1111&lon=2.2222&zoom=6 )

For the left map

* lat
* lon

Optional for the right map, if not given both maps start with the same area. Then use the desync to rearrange the maps

* latc
* lonc

Optional

* zoom

To compare Berlin and Paris

> [#lat=52.51639&lon=13.37777&latc=48.86102&lonc=2.33585&zoom=11](http://klml.github.com/areacompare/index.html#lat=52.51639&lon=13.37777&lat1=48.86102&lon1=2.33585&zoom=12)

## Examples

* [Bodensee and Lake Victoria](http://klml.github.com/areacompare/index.html#lat=47.6333&lon=9.36666&latc=-1&lonc=33&zoom=9) (Biggest German  [lake and biggest](http://en.wikipedia.org/wiki/List_of_lakes_by_area) African lake)
* [Rhine-Ruhr and Tokyo](http://klml.github.com/areacompare/index.html#lat=51.24329&lon=7.02857&latc=35.73463&lonc=139.76538&zoom=10) ([Biggest German metropolitan area](http://en.wikipedia.org/wiki/Rhine-Ruhr) and [world biggest metropolitan area](http://en.wikipedia.org/wiki/Greater_Tokyo_Area))
* [New York and Beijing](http://klml.github.com/areacompare/index.html#lat=40.70109&lon=-73.9953&latc=39.90521&lonc=116.369&zoom=12)
* [Apfeltrang and Ketterschwang](http://klml.github.com/areacompare/index.html#lat=47.83904&lon=10.59219&latc=47.96599&lonc=10.70132&zoom=16) (two typical kind of linear village (Straßendorf) and clustered village (Haufendorf))

## Similar

* [areacompare.com](http://areacompare.com) See maps of two places compared at equal scale
* [thetruesize.com](https://thetruesize.com)
* [mvexel.github.io/thenandnow/](https://mvexel.github.io/thenandnow/) compares osm of today to the one from 2007

## License
[Creative Commons BY-SA 2.0](http://creativecommons.org/licenses/by-sa/2.0/)
