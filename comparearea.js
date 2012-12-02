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
        if( this.location.hash.slice('1') == newhash || this.location.hash == '' ) return ; // prevent trigger from updateHash 
        parseParams();

        //for (var n=0; n <= 1; n++) { // only works changing zoom
            //console.log( 'params ' + startlon[0] +  ' ' + startlat[0] + ' - ' + startlon[1] + ' ' + startlat[1]);
            //console.log( n + ' ' + startlon[n] +  ' ' + startlat[n] );
            wgs1984centermap(0);
            wgs1984centermap(1);
        //};
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
    newhash = 'lat=' + pos[0].lat + '&lon=' + pos[0].lon + '&latc=' + pos[1].lat + '&lonc=' + pos[1].lon + '&zoom=' + pos[0].zoom ;
    window.location.hash = newhash ;
}
function parseParams() {
    var hash = window.location.hash; // TODO backwards compability
    if (hash != '') {
        paras = hash.slice('1').split('&') ;
        for (var i = 0; i < paras.length; i++) {
            var p = paras[i].split('=');
            startCoor(p[0], p[1]);
        }
    }
}
function startCoor(param, v) {
    switch (param) {
        case 'lon' :
        case 'lon0':
        case 'mlon' :
        case 'mlon0':
            startlon[0] = Number(v);
            startlon[1] = Number(v); // if no right value is given, will be overwritten
        break;

        case 'lat':
        case 'lat0':
        case 'mlat':
        case 'mlat0':
            startlat[0] = Number(v);
            startlat[1] = Number(v); // if no right value is given, will be overwritten
        break;

        case 'lon1':
        case 'lon2':
        case 'lonc': // c for compare 
        case 'mlon1': // using an marker osm link
        case 'mlon2':
        case 'mlonc':
            startlon[1] = Number(v);   break;
        case 'lat1':
        case 'lat2':
        case 'latc':
        case 'mlat1':
        case 'mlat2':
        case 'mlatc':
            startlat[1] = Number(v);   break;

        case 'zoom':  zoom = parseInt(v); break;
        case 'z':     zoom = parseInt(v); break;
        case 'x':        x = parseInt(v); break;
        case 'y':        y = parseInt(v); break;
    }
}
function MapPosition(lon, lat, zoom) {
    this.lon = lon;
    this.lat = lat;
    this.zoom = zoom;
}
/* payload */
var crosshairs ='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAAZiS0dEAMQAxADE73nNUQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kBHBEbBoP7gTgAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAdUlEQVQ4y81UQQ7AIAijy/7/5e6wuBBGUBSz9WpTSy2CpDQAEAtqws2BOnvxDxkAAPcyD0OCGSwJeq7LHZ6rAtbl3gy9GqQds0LFZhh1jORTZpLsccsz3DIyojroMfX46U2ZNR5mOCP6r8+hZJd7MXzjMPM4FyigMiYeY2efAAAAAElFTkSuQmCC'
