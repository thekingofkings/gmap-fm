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
	
	message( 'Please pinpoint the bottom left coner of origin region.' );
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
	
	message( 'Please pinpoint the bottom left coner of destination region.' );
}
	

	
function mouseClick(event) {
	// draw original region
	if (drawOrgFlag == 0)
	{
		orgLatLngs.push( event.latLng );
		addMarker( event.latLng );
		drawOrgFlag = 1;
		message( 'Please pinpoint the top right coner of origin region.' );
	}
	else if (drawOrgFlag == 1)
	{
		orgLatLngs.push( event.latLng );
		orgRegion = drawRegion( orgLatLngs, "#008000" );
		drawOrgFlag = 2;
		c = [[orgLatLngs[0].k, orgLatLngs[0].A], [orgLatLngs[1].k, orgLatLngs[1].A]];
		message( "Origin selected:" + c);
	}
	
	// draw destination region
	if (drawDstFlag == 0)
	{
		dstLatLngs.push( event.latLng );
		addMarker( event.latLng );
		drawDstFlag = 1;
		message( 'Please pinpoint the top right coner of destination region.' );
	}
	else if (drawDstFlag == 1)
	{
		dstLatLngs.push( event.latLng );
		dstRegion = drawRegion( dstLatLngs, "#800000");
		drawDstFlag = 2;
		c = [[dstLatLngs[0].k, dstLatLngs[0].A], [dstLatLngs[1].k, dstLatLngs[1].A]];
		message( "Destination selected:" + c );
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


function drawRegion( latLngPair, color )
{
	// clear marker
	removeShownMarkers();
	
	var bbox = new google.maps.LatLngBounds( latLngPair[0], latLngPair[1] );
	var rectangle = new google.maps.Rectangle( {
		strokeColor: color,
		strokeOpacity: 0.8,
		strokeWeight: 2,
		map: map,
		bounds: bbox
	});
	return rectangle;
}

function drawRegion_4coor( lat_l, lng_l, lat_r, lng_r )
{
	l = new google.maps.LatLng(lat_l, lng_l);
	r = new google.maps.LatLng(lat_r, lng_r);
	
	var bbox = new google.maps.LatLngBounds( l, r );
	var rect = new google.maps.Rectangle( {
		strokeColor: '#00ee00',
		strokeOpacity: 0.9,
		strokeWeight: 2,
		map: map,
		bounds: bbox
	});
	return rect;
}


function drawRegion_bbox ( box )
{
	return drawRegion_4coor(box[0], box[1], box[2], box[3]);
}


function accessibility()
{
	var regions = [
		[37.776752824049225, -122.39280223846436, 37.780806205952054, -122.38651514053345],
		[37.780827405063945, -122.3927915096283, 37.78536811469731, -122.38640785217285],
		[37.78084012452816, -122.3992395401001, 37.78528332342268, -122.39280223846436],
		[37.77666802289111, -122.39947557449341, 37.780772287360435, -122.3928451538086], 
		[37.77222430611356, -122.39966869354248, 37.7766510626478, -122.39286661148071],
		[37.77220734485087, -122.39280223846436, 37.77663410240062, -122.38662242889404],
		[37.78540203117992,-122.39282369613647,37.79038758480464,-122.38610744476318],
		[37.78533419819913,-122.39928245544434,37.79018409940419,-122.39293098449707],
		[37.785096782276035,-122.40679264068604,37.790116270812874,-122.39936828613281],
		[37.78045005996349,-122.40679264068604,37.78496111569183,-122.39936828613281],
		[37.77646449971476,-122.40700721740723,37.780382222437794,-122.39953994750977],
		[37.77190204145678,-122.40780115127563,37.77660018189458,-122.39975452423096],
		[37.76700005325191,-122.40786552429199,37.77180027337861,-122.39977598190308],
		[37.767017015709065,-122.39964723587036,37.77215646103938,-122.39288806915283],
		[37.766559028000074,-122.39275932312012,37.77219038358426,-122.38662242889404]
	];
	
	var volume = [2278, 1522, 3339, 2487, 2027, 138, 1340, 3373, 10206, 4286, 2770, 2773, 2269, 1912, 113];
	var accessibility = [2.91281425365526, 3.4091342560097, 2.32007320978184, 2.47634373054685, 2.02406171033392, 2.47069372336051, 2.43061871360756, 2.27592819010682, 2.35777016804431, 2.21572898947295, 2.08465278157694, 1.99405451303703, 1.93590176975279, 1.88941617723705, 1.88615055257702];
	var avgSpeed = [7.01834832890339, 15.0366174063577, 14.7987995621722, 17.216423670516, 12.7600308114335, 9.14110517389241, 15.6324522623371, 15.1759237433249, 11.2996083667872, 13.5217670839451, 12.6552526733244, 17.8671382238788, 12.167594702068, 24.7355366902133, 34.3072980297847];
	
	for (var i = 0 ; i < regions.length; i++)
	{
		drawRegion_bbox( regions[i] );
		var center = [ ( 1/ 5 * regions[i][0] + 4/ 5 * regions[i][2] ) , ( 4/5 * regions[i][1] + 1/5* regions[i][3] )];
		var marker  = new MarkerWithLabel( {
			position: new google.maps.LatLng( center[0], center[1] ),
			map: map,
			labelContent: "<p>V: " + volume[i] + "</p><p>A: " + accessibility[i].toFixed(2) + 
					"</p><p>S: " + avgSpeed[i].toFixed(2) + "</p>",
			labelClass: "markerLabel"
		});
	}
	return regions;
}	


//============== Trip plot function ===================

function plotTrips()
{
	if ( isGameDay )
	{
		for (i = 0; i < gdtrips.length; i++)
		{
			// plot the trip on Maps
			gdtrips[i].setMap( map );
			shownTrips.push( gdtrips[i] );
		}
	}
	else
	{
		for (i = 0; i < ngdtrips.length; i++)
		{
			// plot the trip on Maps
			ngdtrips[i].setMap( map );
			shownTrips.push( ngdtrips[i] );
		}
	}
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


function message( content )
{
	$('#line').html( content )
}



function AJAXqueryTrips() {
	// org and dst should have longitude before latitude
	var queryData = {
		org: [ 	[orgLatLngs[0].A, orgLatLngs[0].k],
					[orgLatLngs[1].A, orgLatLngs[1].k]	],
		dst: [	[dstLatLngs[0].A, dstLatLngs[0].k],
					[dstLatLngs[1].A, dstLatLngs[1].k], 	]
	};
	message("Query trips from server ... ");
	return $.getJSON( "qtrips", JSON.stringify(queryData), function( data ) {
		testVar = data;
		// data is JSON format object, representing the coordinates of each trip
		message( '#gameday trip: ' + data.gd.length + '; #non-game day trip: '
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
			
		google.maps.event.addListener(tripPath, 'mouseover', showTripMarkers);
		google.maps.event.addListener(tripPath, 'mouseout', removeShownMarkers);
		
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
		
		google.maps.event.addListener(tripPath, 'mouseover', showTripMarkers);
		google.maps.event.addListener(tripPath, 'mouseout', removeShownMarkers);
			
		// save trips in global space.
		ngdtrips.push(tripPath);
	}
}