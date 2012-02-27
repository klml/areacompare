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
var proj4326  = new OpenLayers.Projection('EPSG:4326'), projmerc  = new OpenLayers.Projection('EPSG:900913');

var startCenter = new Array();
var touchdown = new Array();

var center = new Array();
var pos = new Array();

var sync = 'resync';


jQuery(document).ready(function() {

    parseParams(function(param, v) {
        switch (param) {
            case 'lon':    startlon[0] = Number(v);   break;
            case 'lat':    startlat[0] = Number(v);   break;
            case 'lon0':    startlon[0] = Number(v);   break;
            case 'lat0':    startlat[0] = Number(v);   break;
            case 'lon1':    startlon[1] = Number(v);   break;
            case 'lat1':    startlat[1] = Number(v);   break;
            case 'lon2':    startlon[1] = Number(v);   break; // http://de.wikipedia.org/wiki/Off-by-one-Error ;)
            case 'lat2':    startlat[1] = Number(v);   break;
            case 'lonc':    startlon[1] = Number(v);   break; // c for compare 
            case 'latc':    startlat[1] = Number(v);   break;
            case 'zoom':  zoom = parseInt(v); break;
            case 'z':     zoom = parseInt(v); break;
            case 'x':        x = parseInt(v); break;
            case 'y':        y = parseInt(v); break;
        }
    });

    for (var n=0; n <= 1; n++) {

        maps[n] = new OpenLayers.Map('map' + n);
        var mapnik = new OpenLayers.Layer.OSM();
        maps[n].addLayer(mapnik);
        maps[n].setCenter(new OpenLayers.LonLat(startlon[n],startlat[n]) // Center of the map
            .transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
            new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
            ), zoom
        );
//~ //      newLayer(n, mt[n]);
//~ //        setStartPos(n, pos.getLonLat(), pos.zoom);
        initMarker(n);
        maps[n].events.register('movestart', n, moveStart);
        maps[n].events.register('moveend',   n, moveEnd);
        maps[n].events.register('mousemove', n, mouseMove);
        maps[n].events.register('mouseover', n, mouseOver);
        maps[n].events.register('mouseout',  n, mouseOut);
    };
    map = maps[0];
    updatePermalink();
});

jQuery('button#sync').click( function() {
    oldsync = sync ;
    sync = jQuery(this).html();
    jQuery(this).html(oldsync)
    jQuery('#map1 #OpenLayers.Control.PanZoom_125.olControlPanZoom').toggle();
    jQuery('#map-decoration').toggle();
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
        if (moving || sync == 'desync' ) {
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
        updatePermalink();
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
function updatePermalink() {
    for (var n=0; n <= 1; n++) {
        center[n] = maps[n].getCenter().clone().transform(maps[n].getProjectionObject(), proj4326);
        pos[n] = new MapPosition(
            Math.round(center[n].lon * 100000) / 100000,
            Math.round(center[n].lat * 100000) / 100000,
            maps[n].getZoom()
        );
    };

    jQuery('#permalink')[0].href = 'index.html?lat=' + pos[0].lat + '&lon=' + pos[0].lon + '&latc=' + pos[1].lat + '&lonc=' + pos[1].lon + '&zoom=' + pos[0].zoom;
    jQuery('#customZoomLevel').html('zoom=' + pos[0].zoom );
}

// from http://tools.geofabrik.de/js/common.js
function parseParams(handler) {
    var perma = location.search.substr(1);
    if (perma != '') {
        paras = perma.split('&');
        for (var i = 0; i < paras.length; i++) {
            var p = paras[i].split('=');
            handler(p[0], p[1]);
        }
    }
}
function MapPosition(lon, lat, zoom) {
    this.lon = lon;
    this.lat = lat;
    this.zoom = zoom;
}

/* payload */
var crosshairs ='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAAZiS0dEAMQAxADE73nNUQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kBHBEbBoP7gTgAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAdUlEQVQ4y81UQQ7AIAijy/7/5e6wuBBGUBSz9WpTSy2CpDQAEAtqws2BOnvxDxkAAPcyD0OCGSwJeq7LHZ6rAtbl3gy9GqQds0LFZhh1jORTZpLsccsz3DIyojroMfX46U2ZNR5mOCP6r8+hZJd7MXzjMPM4FyigMiYeY2efAAAAAElFTkSuQmCC'