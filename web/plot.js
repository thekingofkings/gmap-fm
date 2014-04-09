// load the initializer function at the beginning
google.maps.event.addDomListener( window, 'load', initialize );

var map;
var isGameDay = true;
var gdtrips = [];
var ngdtrips = [];
var cntClick = 0;
var orgLatLngs = [];
var dstLatLngs = [];
var orgRegion = null;
var drawOrgFlag = -1;
var dstRegion = null;
var drawDstFlag = -1;
var shownTrips = [];
var shownMarkers = [];

var testVar = null;


function initialize() {
	var mapOptions = {
		center: new google.maps.LatLng( 37.770592, -122.439231 ),
		zoom: 14
	};
	map = new google.maps.Map(document.getElementById("map-canvas"),
			mapOptions);
	google.maps.event.addListener(map, 'click', mouseClick);
	
}

function setDayType() {
	if (shownTrips.length > 0)
		hideTrips();
	
	// set day type according to radio button
	if ($('input:checked[name="daytype"]').val() == 'game')
	{
		isGameDay = true;
	}
	else if ( $('input:checked[name="daytype"]').val() == 'nongame')
	{
		isGameDay = false;
	}
	
	
	// if two regions do not change, then plot the trips
	if (orgRegion != null && dstRegion != null)
		plotTrips();
}



function setOrg() {
	drawOrgFlag = 0;
	drawDstFlag = -1;
	orgLatLngs = [];
	if (orgRegion != null) 
	{
		orgRegion.setMap(null);
		orgRegion = null;
	}
	
	message( 2, 'Please pinpoint the bottom left coner of origin region.' );
}

function setDst() {
	drawDstFlag = 0;
	drawOrgFlag = -1;
	dstLatLngs = [];
	if (dstRegion != null)
	{
		dstRegion.setMap(null);
		dstRegion = null;
	}
	
	message( 2, 'Please pinpoint the bottom left coner of destination region.' );
}
	

	
function mouseClick(event) {
	// draw original region
	if (drawOrgFlag == 0)
	{
		orgLatLngs.push( event.latLng );
		addMarker( event.latLng );
		drawOrgFlag = 1;
		message( 2, 'Please pinpoint the top right coner of origin region.' );
	}
	else if (drawOrgFlag == 1)
	{
		orgLatLngs.push( event.latLng );
		orgRegion = drawRegion( orgLatLngs );
		drawOrgFlag = 2;
		message( 2, orgRegion.getBounds().toString() );
	}
	
	// draw destination region
	if (drawDstFlag == 0)
	{
		dstLatLngs.push( event.latLng );
		addMarker( event.latLng );
		drawDstFlag = 1;
		message( 2, 'Please pinpoint the top right coner of destination region.' );
	}
	else if (drawDstFlag == 1)
	{
		dstLatLngs.push( event.latLng );
		dstRegion = drawRegion( dstLatLngs );
		drawDstFlag = 2;
		message( 2, dstRegion.getBounds().toString() );
	}
}


function addMarker( point )
{
	var marker = new google.maps.Marker({
			position: point,
			map: map
	});
	shownMarkers.push(marker);
}


function drawRegion( latLngPair )
{
	// clear marker
	removeShownMarkers();
	
	var bbox = new google.maps.LatLngBounds( latLngPair[0], latLngPair[1] );
	var rectangle = new google.maps.Rectangle( {
		strokeColor: "#800000",
		strokeOpacity: 0.8,
		strokeWeight: 2,
		map: map,
		bounds: bbox
	});
	return rectangle;
}

//============== Trip plot function ===================

function plotTrips()
{
	var trips = [];
	if ( isGameDay )
	{
		trips = gdtrips;
	}
	else
	{
		trips = ngdtrips;
	}
	
	cnt = 0;
	for (i = 0; i < trips.length; i++)
	{
		var tripPath = trips[i];
		// plot the trip on Maps
		tripPath.setMap( map );
		google.maps.event.addListener(tripPath, 'mouseover', showTripMarkers);
		google.maps.event.addListener(tripPath, 'mouseout', removeShownMarkers);
		shownTrips.push(tripPath);
		cnt ++;
	}
	return cnt;
}
	
	
function showTripMarkers(event) {
	var points = this.getPath();
	
	for (var i = 0; i < points.getLength(); i++)
	{
		var point = points.getAt(i);

		// add a new marker
		addMarker( point );
	}

}


function removeShownMarkers(event) {
	for ( i = 0; i < shownMarkers.length; i++ )
	{
		shownMarkers[i].setMap(null);
	}
	shownMarkers = [];
}


function hideTrips()
{
	for (i = 0; i < shownTrips.length; i++)
	{
		shownTrips[i].setMap(null);
	}
	shownTrips = [];
}


function message( lineNo, content )
{
	$('#line' + lineNo).html( content )
}



function AJAXqueryTrips() {
	// org and dst should have longitude before latitude
	var queryData = {
		org: [ 	[orgLatLngs[0].A, orgLatLngs[0].k],
					[orgLatLngs[1].A, orgLatLngs[1].k]	],
		dst: [	[dstLatLngs[0].A, dstLatLngs[0].k],
					[dstLatLngs[1].A, dstLatLngs[1].k], 	]
	};
	message(2, "Query trips from server ... ");
	return $.getJSON( "qtrips", JSON.stringify(queryData), function( data ) {
		testVar = data;
		// data is JSON format object, representing the coordinates of each trip
		message(2, '#gameday trip: ' + data.gd.length + '; #non-game day trip: '
				+ data.ngd.length);
		// create google map objects from the JSON coordinates 
		mapTrips( data );
		// plot the google map PolyLine Objects on map
		plotTrips();
	});
	
}


function mapTrips( queryRes ) {
	gdtrips = [];
	ngdtrips = [];
	// map the game day trip into google map object
	for (var i = 0; i < queryRes.gd.length; i++)
	{
		var googlePoints = [];
		for (var j = 0; j < queryRes.gd[i].length; j++)
		{
			var p = new google.maps.LatLng( queryRes.gd[i][j][1], queryRes.gd[i][j][0] );
			googlePoints.push(p);
		}
		
		var tripPath = new google.maps.Polyline({
			path: googlePoints,
			geodesic: true,
			strokeColor: '#9370DB',
			strokeOpacity: 1.0,
			strokeWeight: 2,
			editable: true
		});
			
		// save trips in global space.
		gdtrips.push(tripPath);
	}
	
	// map the non-game day trip into google map object
	for (var i = 0; i < queryRes.ngd.length; i++)
	{
		var googlePoints = [];
		for (var j = 0; j < queryRes.ngd[i].length; j++)
		{
			var p = new google.maps.LatLng( queryRes.ngd[i][j][1], queryRes.ngd[i][j][0] );
			googlePoints.push(p);
		}
		
		var tripPath = new google.maps.Polyline({
			path: googlePoints,
			geodesic: true,
			strokeColor: '#DC143C',
			strokeOpacity: 1.0,
			strokeWeight: 2,
			editable: true
		});
			
		// save trips in global space.
		ngdtrips.push(tripPath);
	}
}