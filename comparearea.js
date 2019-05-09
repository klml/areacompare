// TODO crosshair after resync
// adapted from http://tools.geofabrik.de/mc/mc.js

var startlon  = new Array('11.575278','16.372778');
var startlat = new Array('48.137222','48.208333');
var zoom = 15 ;

var maps = new Array();
var map;
var layers = new Array();
var markersLayer = new Array();
var marker = new Array();
var moving = false;
var movestarted = false;
var hashing = false;
var proj4326  = new OpenLayers.Projection('EPSG:4326'), projmerc  = new OpenLayers.Projection('EPSG:900913');

var startCenter = new Array();
var touchdown = new Array();

var center = new Array();
var pos = new Array();

var sync = 'resync';

var newhash = '';


jQuery(document).ready(function() {

    parseParams();

    for (var n=0; n <= 1; n++) {

        maps[n] = new OpenLayers.Map('map' + n);
        var mapnik = new OpenLayers.Layer.OSM();
        maps[n].addLayer(mapnik);
        
        wgs1984centermap(n);
//~ //      newLayer(n, mt[n]);
//~ //        setStartPos(n, pos.getLonLat(), pos.zoom);
        initMarker(n);
        maps[n].events.register('movestart', n, moveStart);
        maps[n].events.register('moveend',   n, moveEnd);
        maps[n].events.register('mousemove', n, mouseMove);
        maps[n].events.register('mouseover', n, mouseOver);
        maps[n].events.register('mouseout',  n, mouseOut);
    };


    $(window).bind('hashchange', function() {
        if( this.location.hash.slice('1') == newhash || this.location.hash == '' || hashing == true ) return ; // prevent trigger from updateHash 
        parseParams();
        hashing = true ; // avoid change trigger

        wgs1984centermap(0);
        wgs1984centermap(1);

        hashing = false ;

    });
});

function wgs1984centermap(n) {
        maps[n].setCenter(new OpenLayers.LonLat(startlon[n],startlat[n]) // Center of the map
            .transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
            new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
            ), zoom
        );
};


jQuery('button#sync').click( function() {
    oldsync = sync ;
    sync = jQuery(this).html();
    initMarker(0);
    initMarker(1);
    updateHash();
    jQuery(this).html(oldsync);
    jQuery('#map1 .olControlPanZoom').toggle('fast');
});

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
        markersLayer[1-this].setVisibility(true);
        if (sync == 'desync' ) {
            window.location.hash = ''; // useless, no shared zoom
            return;
        }
        if (moving) {
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
        movestarted = false;
        updateHash();
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
    //~ jQuery('#customMousePosition').show();
    return(false);
}

function mouseOut(evt) {
    markersLayer[0].setVisibility(false);
    markersLayer[1].setVisibility(false);
    //~ jQuery('#customMousePosition').hide();
    return(false);
}

function initMarker(n) {
    markersLayer[n] = new OpenLayers.Layer.Markers("Marker");
    maps[n].addLayer(markersLayer[n]);
    marker[n] = new OpenLayers.Marker(maps[n].getCenter(),
            new OpenLayers.Icon(crosshairs, new OpenLayers.Size(20, 20), new OpenLayers.Pixel(-10, -10))
    );
    markersLayer[n].setVisibility(false);
    markersLayer[n].addMarker(marker[n]);
}
function updateHash() {
    for (var n=0; n <= 1; n++) {
        center[n] = maps[n].getCenter().clone().transform(maps[n].getProjectionObject(), proj4326);
        pos[n] = new MapPosition(
            Math.round(center[n].lon * 100000) / 100000,
            Math.round(center[n].lat * 100000) / 100000,
            maps[n].getZoom()
        );
    };

    // use hash seperator "/" from openstreetmap.org
    // https://www.openstreetmap.org/#map=15/48.137222/11.575278
    newhash = pos[0].zoom + '/' + pos[0].lat + '/' + pos[0].lon + '/' + pos[1].lat + '/' + pos[1].lon ;
    window.location.hash = newhash ;
}
function parseParams() {
    var hash = window.location.hash; // TODO backwards compability
    if (hash != '') {
        paras = hash.slice('1').split('/') ;
        zoom        = paras[0]
        startlat[0] = paras[1]
        startlon[0] = paras[2]
        startlat[1] = paras[3]
        startlon[1] = paras[4]
    }
}
function MapPosition(lon, lat, zoom) {
    this.lon = lon;
    this.lat = lat;
    this.zoom = zoom;
}
/* payload */
var crosshairs ='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAAZiS0dEAMQAxADE73nNUQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kBHBEbBoP7gTgAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAdUlEQVQ4y81UQQ7AIAijy/7/5e6wuBBGUBSz9WpTSy2CpDQAEAtqws2BOnvxDxkAAPcyD0OCGSwJeq7LHZ6rAtbl3gy9GqQds0LFZhh1jORTZpLsccsz3DIyojroMfX46U2ZNR5mOCP6r8+hZJd7MXzjMPM4FyigMiYeY2efAAAAAElFTkSuQmCC'
