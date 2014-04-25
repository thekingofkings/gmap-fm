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


/*********************************************************
Assistant function for the C# project SFTaxi
*********************************************************/


function Grid( )
{
	this.lowerLeft = [37.74027582404923, -122.51225523839999];
	this.upperRight = [37.81323020595205, -122.38651514053345];
	this.latStep = 0.004053;
	this.lngStep = 0.006287;
	this.widthN = 20;
	this.heightN = 18;
	
	this.plotGrid = function( bbox, row, column ) {
		var grid = drawRegion_bbox( bbox );
		grid.row = row;
		grid.column = column;
		grid.id = row * this.widthN + column;
		
		google.maps.event.addListener(grid, 'mouseover', function(event) {
			message('Grid row ' + this.row + ' column ' + this.column + ' id ' + this.id);
		});
		
		google.maps.event.addListener(grid, 'mouseout', function(event) {
			message('');
		});
		
		return grid;
	};
	
	this.plotAllGrids= function() {
		for (var row = 0; row < this.heightN; row ++)
		{
			for (var column = 0; column < this.widthN; column ++)
			{
				bbox = [ this.lowerLeft[0] + this.latStep * (this.heightN - row -1), 
						this.lowerLeft[1] + this.lngStep * column,
						this.upperRight[0] - this.latStep * row, 
						this.upperRight[1] - this.lngStep * (this.widthN - 1 - column)];
				
				this.plotGrid( bbox, row, column );
			}
		}
	};
	
	
	this.plotByID = function( id ) {
		var row = Math.floor(id / this.widthN);
		var column = id % this.widthN;
		var bbox = [ this.lowerLeft[0] + this.latStep * (this.heightN - row -1), 
						this.lowerLeft[1] + this.lngStep * column,
						this.upperRight[0] - this.latStep * row, 
						this.upperRight[1] - this.lngStep * (this.widthN - 1 - column)];
		return this.plotGrid( bbox, row, column );
	};
}	
	
	
function drawRegion_bbox ( box )
{
	return drawRegion_4coor(box[0], box[1], box[2], box[3]);
}


function accessibility()
{
	var regions = [137, 138, 139, 157, 158, 159, 177, 178, 179, 197, 198, 199, 217, 218, 219];
	
	var v1 = [11826, 3700, 1623, 6014, 3657, 1406, 3495, 2857, 2033, 2515, 2680, 137, 912, 2352, 97];
	var v2 = [10492, 3901, 1407, 4953, 4350, 2291, 3250, 3071, 3196, 2311, 2322, 151, 1057, 1846, 83];
	
	var a1 = [13.0381577014044, 12.6096982082428, 12.9194285019246, 13.2175308750015, 12.8902845414743, 12.9915606176284, 13.5862235483038, 14.6938165680636, 14.6735667526119, 15.4972731769754, 16.4805210147651, 16.4801740275546, 16.4394525057699, 16.3285803773627, 16.3156156500416];
	var a2 = [13.4894762377926, 12.3788521528668, 12.2124168985085, 14.2135102804244, 13.2301725812591, 16.2221395473468, 15.5366557272417, 16.186555124657, 16.4428194911355, 16.2006672638062, 16.5429368846066, 16.6074677181219, 16.5415244498326, 16.1980121417687, 16.179951584071];
	
	var s1 = [15.0256446662391, 18.4909268529557, 35.2882501507142, 16.9738181494622, 24.5596205844427, 23.3984486260933, 28.0131702468387, 25.8148290381372, 23.6249628771044, 25.8519467243805, 26.9357524138659, 26.5623532194627, 26.191256779436, 49.256115134887, 45.66392354355];
	var s2 = [14.5447710679074, 24.4296700763784, 33.5107182091272, 18.4990154606122, 24.1224966867811, 17.8608294822235, 28.9617089765353, 21.5409437294058, 18.365432136799, 35.4262425637387, 20.9916674134994, 20.6822775181056, 25.5799442600732, 45.0332947989897, 25.7066752833852];
		
	
	var ploter = new Grid();
	
	for (var i = 0 ; i < regions.length; i++)
	{
		var grid = ploter.plotByID( regions[i] );
		
		grid.describ = "V: " + v1[i] + " A: " + a1[i].toFixed(2) + 
					" S: " + s1[i].toFixed(2) + "<br>V: " + v2[i] + " A: " + 
					a2[i].toFixed(2) + 	" S: " + s2[i].toFixed(2);
					
		google.maps.event.addListener(grid, 'mouseover', function(event) {
			message( this.describ );
		});
		
		
		/* plot with labeled marker
		var center = [ ( 1/ 5 * regions[i][0] + 4/ 5 * regions[i][2] ) , ( 4/5 * regions[i][1] + 1/5* regions[i][3] )];
		var marker  = new MarkerWithLabel( {
			position: new google.maps.LatLng( center[0], center[1] ),
			map: map,
			labelContent: "<p>V: " + v1[i] + "</p><p>A: " + a1[i].toFixed(2) + 
					"</p><p>S: " + s1[i].toFixed(2) + "</p>" + "<p>V: " + v2[i] + "</p><p>A: " + 
					a2[i].toFixed(2) + 	"</p><p>S: " + s2[i].toFixed(2) + "</p>";
			labelClass: "markerLabel"
		});
		*/
	}
	return regions;
}
