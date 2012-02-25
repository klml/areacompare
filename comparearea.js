// TODO read get
// TODO inputs
// TODO auf sync reezoom

// adapted from http://tools.geofabrik.de/mc/mc.js

var start0 = new Array( '11.575278','48.137222' );
var start1 = new Array( '16.372778','48.208333' );

var maps = new Array();
var map;
var layers = new Array();
var markersLayer = new Array();
var marker = new Array();
var moving = false;
var movestarted = false;
var proj4326  = new OpenLayers.Projection('EPSG:4326'), projmerc  = new OpenLayers.Projection('EPSG:900913');

var startCenter = new Array();
var touchdown = new Array();

var sync = true;

function init() {
    for (var n=0; n <= 1; n++) {
        switch (n) {
            case 1:
            startn = start1;
        break;
        default:
            startn = start0;
        break;
        };

        maps[n] = new OpenLayers.Map('map' + n);
        var mapnik = new OpenLayers.Layer.OSM();
        maps[n].addLayer(mapnik);
        maps[n].setCenter(new OpenLayers.LonLat(startn[0],startn[1]) // Center of the map
            .transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
            new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
            ), 15 // Zoom level
        );
//      newLayer(n, mt[n]);
//        setStartPos(n, pos.getLonLat(), pos.zoom);
        initMarker(n);
        maps[n].events.register('movestart', n, moveStart);
        maps[n].events.register('moveend',   n, moveEnd);
        maps[n].events.register('mousemove', n, mouseMove);
        maps[n].events.register('mouseover', n, mouseOver);
        maps[n].events.register('mouseout',  n, mouseOut);
    }
    map = maps[0];
};

function desync() {
    sync = false;
}
function tosync() {
    sync = true;
}

    // geofabrik // geofabrik // geofabrik
function moveStart() {
    movestarted = true;
    startCenter['lon'] = maps[this].getCenter().lon;
    startCenter['lat'] = maps[this].getCenter().lat;
    markersLayer[0].setVisibility(false);
    markersLayer[1].setVisibility(false);
    return(false);
}
function moveEnd() {
        if (moving || sync == false ) {
            return;
        }
        moving = true;

        touchdown['lon'] = maps[this].getCenter().lon - startCenter['lon'] + maps[1-this].getCenter().lon,
        touchdown['lat'] = maps[this].getCenter().lat - startCenter['lat'] + maps[1-this].getCenter().lat
        
        maps[1-this].setCenter(
            new OpenLayers.LonLat(touchdown['lon'],touchdown['lat']) // Center of the map
          , maps[this].getZoom()
        );
        moving = false;
        //updatePermalink();
        movestarted = false;
        markersLayer[1-this].setVisibility(true);
        return(false);
}

function mouseMove(evt) {
    marker[1-this].moveTo(maps[this].getLayerPxFromViewPortPx(evt.xy));
    return(false);
}

function mouseOver(evt) {
    if (! movestarted) {
        markersLayer[1-this].setVisibility(true);
    }
   // jQuery('#customMousePosition').show();
    return(false);
}

function mouseOut(evt) {
    markersLayer[0].setVisibility(false);
    markersLayer[1].setVisibility(false);
 //   jQuery('#customMousePosition').hide();
    return(false);
}

function initMarker(n) {
    markersLayer[n] = new OpenLayers.Layer.Markers("Marker");
    maps[n].addLayer(markersLayer[n]);
    marker[n] = new OpenLayers.Marker(maps[n].getCenter(),
            new OpenLayers.Icon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAAZiS0dEAMQAxADE73nNUQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kBHBEbBoP7gTgAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAdUlEQVQ4y81UQQ7AIAijy/7/5e6wuBBGUBSz9WpTSy2CpDQAEAtqws2BOnvxDxkAAPcyD0OCGSwJeq7LHZ6rAtbl3gy9GqQds0LFZhh1jORTZpLsccsz3DIyojroMfX46U2ZNR5mOCP6r8+hZJd7MXzjMPM4FyigMiYeY2efAAAAAElFTkSuQmCC', new OpenLayers.Size(20, 20), new OpenLayers.Pixel(-10, -10))
    );
    markersLayer[n].setVisibility(false);
    markersLayer[n].addMarker(marker[n]);
};