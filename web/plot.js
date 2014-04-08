// load the initializer function at the beginning
google.maps.event.addDomListener( window, 'load', initialize );

var map;
var trips = [];
var cntClick = 0;
var clickLatLngs = [];
var orgRegion = null;
var drawOrgFlag = -1;
var dstRegion = null;
var drawDstFlag = -1;
var shownTrips = [];
var shownMarkers = [];


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
	var data_selector, trip_selector, trip_color, daytype;
	
	// set day type according to radio button
	if ($('input:checked[name="daytype"]').val() == 'game')
	{
		data_selector = '#gd-data';
		trip_selector = 'div.gd-trip';
		trip_color = '#9370DB';
		daytype = 'Game day';
	}
	else if ( $('input:checked[name="daytype"]').val() == 'nongame')
	{
		data_selector = '#ngd-data';
		trip_selector = 'div.ngd-trip';
		trip_color = '#DC143C';
		daytype = 'Non-game day';
	}
	
	var cnt = 0;
	// find the trips of each day and save in global space.
	$(data_selector).children(trip_selector).each( 
		function (index, trip) {
			var tripCoords = [];
			// find the records of one trip
			$(trip).children('p').each( 
				function (ind, r ) {
					lat = parseFloat( $(r).children('span.latitude').html() );
					lon = parseFloat( $(r).children('span.longitude').html() );
					var point = new google.maps.LatLng( lat, lon );
					
					tripCoords.push( point );
				}
			);
			
		
			var tripPath = new google.maps.Polyline({
				path: tripCoords,
				geodesic: true,
				strokeColor: trip_color,
				strokeOpacity: 1.0,
				strokeWeight: 2,
				editable: true
			});
			
			// save trips in global space.
			trips.push(tripPath);

			cnt++;
		}
	);
	
	message( 1, daytype + '\nTotal trips: ' + cnt);
}



function setOrg() {
	drawOrgFlag = 0;
	drawDstFlag = -1;
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
		clickLatLngs.push( event.latLng );
		addMarker( event.latLng );
		drawOrgFlag = 1;
		message( 2, 'Please pinpoint the top right coner of origin region.' );
	}
	else if (drawOrgFlag == 1)
	{
		clickLatLngs.push( event.latLng );
		orgRegion = drawRegion( clickLatLngs );
		drawOrgFlag = 2;
		clickLatLngs = [];
		message( 2, 'Region selected.' );
	}
	
	// draw destination region
	if (drawDstFlag == 0)
	{
		clickLatLngs.push( event.latLng );
		addMarker( event.latLng );
		drawDstFlag = 1;
		message( 2, 'Please pinpoint the top right coner of destination region.' );
	}
	else if (drawDstFlag == 1)
	{
		clickLatLngs.push( event.latLng );
		dstRegion = drawRegion( clickLatLngs );
		drawDstFlag = 2;
		clickLatLngs = [];
		message( 2, 'Region selected.' );
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


function plotTrips()
{	
	cnt = 0;
	for (i = 0; i < trips.length; i++)
	{
		var tripPath = trips[i];
		var tripLength = tripPath.getPath().getLength();
		var firstPoint = tripPath.getPath().getAt(0);
		var lastPoint = tripPath.getPath().getAt( tripLength - 1 );
		var firstBbox = orgRegion.getBounds();
		var secondBbox = dstRegion.getBounds();
		
		if ( (firstBbox.contains(firstPoint) && secondBbox.contains(lastPoint)) 
			|| (firstBbox.contains(lastPoint) && secondBbox.contains(firstPoint)) )
		{
			// plot the trip on Maps
			tripPath.setMap( map );
			google.maps.event.addListener(tripPath, 'mouseover', showTripMarkers);
			google.maps.event.addListener(tripPath, 'mouseout', removeShownMarkers);
			shownTrips.push(tripPath);
			cnt ++;
		}
	}
	message(2, 'In total ' + cnt + ' trips are found.');
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