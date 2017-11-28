//********************************************************************************************
//Add cesium viewer
var viewer = new Cesium.Viewer('cesiumContainer');
viewer.imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
        url : 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
    });
viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
        url : 'https://assets.agi.com/stk-terrain/world',
        requestVertexNormals: true,
        requestWaterMask: false
    });
viewer.baseLayerPicker = false

//********************************************************************************************
//Add a map imagery layer
// var layers = viewer.imageryLayers;
// var mapOverlay = layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
// 	url : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
// }));

// mapOverlay.alpha = .4;
// mapOverlay.brightness = 1.5;

//*********************************************************************************************
//Import flight PATH data, HPR data and TABLE data
var entities = [];
var hpr = [];
var data = [];
var modelEntity;

function getEntities(i) {
	var ds = viewer.dataSources.get(0);
	if(i == 0)
		return ds.entities.getById('pathEntity');
	else if(i == 1)
		return ds.entities.getById('exceedance');
	else
		return ds.entities.getById('model');
}

function createModel(url, hproll) {
    viewer.entities.removeAll();
    //var position = Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, height);

    var entity = viewer.entities.add({
        name : url,
        //position : position,
        orientation : orientation,
        model : {
            uri : url,
            scale : 0.4,
    		minimumPixelSize : 75
        }
    });
    viewer.trackedEntity = entity;
    return entity;
}

function tableData(inAlt, inIAS, inVSI, inOilT) {
	this.altitude = inAlt;
	this.ias = inIAS;
	this.vsi = inVSI;
	this.oiltemp = inOilT;
}
var flightCzml = Cesium.CzmlDataSource.load('./assets/data/PhoenixFlight1.czml'); // CZML LOADING
viewer.dataSources.add(flightCzml).then(function(ds) {
});

Cesium.loadText('./assets/data/tableData1.csv').then(function(text) { //TABLE DATA LOADING
	var box = text.split(',');
	for(var i = 0; i < box.length; i += 4) {
		data[i/4] = new tableData(box[i], box[i+1], box[i+2], box[i+3]) 
	}
	console.log('Table Data Loaded');
}).otherwise(function(err){
	console.log(err);
});

//*********************************************************************************************
//Create a model matrix
 function loadOrientation() {
 	var quat = new Cesium.SampledProperty(Cesium.Quaternion);
 	Cesium.loadText('./assets/data/HPR1.csv').then(function(text) { //HPR DATA LOADING
 		hpr = text.split(',');
 		for(var i = 0; i < hpr.length; i+=4) {
 			//console.log(i);
 			var heading = parseFloat(hpr[i+1]);
 			var pitch = parseFloat(hpr[i+2]);
 			var roll = parseFloat(hpr[i+3]);
 			var hproll = new Cesium.HeadingPitchRoll(heading, pitch, roll);
 			//var current = viewer.clock.currentTime;
 			var quaternion = Cesium.Quaternion.fromHeadingPitchRoll(hproll);
 			//quat.addSample(current, quaternion);
 		}
 		//console.log(quat);
 		console.log('HPR Data Loaded');
 		return quaternion;
 	}).otherwise(function(error) {
 		console.log('ERROR IN HPR DATA: ' + error);
 	});
 }

//*********************************************************************************************
//Update table html with Altitude, IAS, VSI and oil temp
var orientation = loadOrientation();
modelEntity = createModel('./assets/data/Cessna172.glb');

window.setInterval(function update(orientation) {
	// //Try to set orientation of model entity
	modelEntity.orientation = orientation;
	//console.log(theEntity.orientation);
	//console.log(theEntity);
	var currTime = viewer.clock.currentTime;
	var startTime = viewer.clock.startTime;
	var diff = parseInt(Cesium.JulianDate.secondsDifference(currTime, startTime));
}, 100);

//0: exceedance, 1: takeoff, 2: landings
var jumpTimes = [Cesium.JulianDate.fromIso8601('2017-01-02T19:25:37Z'), Cesium.JulianDate.fromIso8601('2017-01-02T19:19:27Z'), Cesium.JulianDate.fromIso8601('2017-01-02T20:36:14Z')];
var ds = viewer.dataSources.get(0);
function jumpTime(i) {
	var newTime = jumpTimes[i];
	viewer.clock.currentTime = newTime;
}

function changeTimeSpeed(mult) {
	if(mult > 0) {
		var newMultiplier = viewer.clock.multiplier * mult;
		viewer.clock.multiplier = newMultiplier;
	} else {
		var newMultiplier = viewer.clock.multiplier / Math.abs(mult);
		viewer.clock.multiplier = newMultiplier;
	}
}

function reverseTimeDirection() {
	var mult = viewer.clock.multiplier;
	mult *= -1;
	viewer.clock.multiplier = mult;
}

function slowTime(mult) {
	var newMultiplier = viewer.clock.multiplier / mult;
	viewer.clock.multiplier = newMultiplier;
}
function getPath(path) {
	return path;
}

function show(i) {
	var theEntity = getEntities(i);
	if(theEntity.show) {
		theEntity.show = false;
		console.log('Path hidden');
	} else {
		theEntity.show = true;
		console.log('Path shown');
	}
}

function changeLead(x) {
	var theEntity = getEntities(0);
	var lt = theEntity.path.leadTime.getValue(viewer.clock.currentTime, lt);
	if(x > 0) {
		lt += 60;
	} else if (x < 0) {
		lt -= 60;
	}
	if(lt >= 0) {
		theEntity.path.leadTime = lt;
		console.log('Lead time changed: ' + lt + ' sec');		
	} else {
		console.log('Lead time not changed.');
	}
	
}

function changeTrail(x) {
	var theEntity = getEntities(0);
	var tt = theEntity.path.trailTime.getValue(viewer.clock.currentTime, tt);
	if(x > 0) {
		tt += 60;
	} else if(x < 0) {
		tt -= 60;
	}
	if(tt >= 0){
		theEntity.path.trailTime = tt;
		console.log('Trail time changed: -' + tt + ' sec');	
	} else {
		console.log('Trail time not changed.');
	}
}

function update() {
	var currTime = viewer.clock.currentTime;
	var startTime = viewer.clock.startTime;
	console.log(parseInt(Cesium.JulianDate.secondsDifference(currTime, startTime)));
}
/*
document.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
        case 85:
            viewer.zoomTo(getEntities(2), new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90), 500)); 
            //viewer.trackedEntity = getEntities(2); 
            break;
        case 73:
            viewer.zoomTo(getEntities(2), new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-90), Cesium.Math.toRadians(-15), 7500)); 	
            //viewer.trackedEntity = getEntities(2);
            break;
        default:
    }
});
*/
//********************************************************************************************
// Import position, hpr and exceedance data
/*
 var pos = []; 
 var exc = [];
 var orientation = new Cesium.SampledProperty(Cesium.HeadingPitchRoll);
 Cesium.loadText('posData1.csv').then(function(text) {
	pos = text.split('\n');
	console.log('Position data imported.');
 }).otherwise(function(error) {
	 console.log('ERROR IN POS DATA: ' + error);
 });
 Cesium.loadText('exceedanceData1.csv').then(function(text) {
 	exc = text.split('\n');
 	console.log('Excedance data imported.');
 }).otherwise(function(error) {
 	console.log('ERROR IN EXCEEDANCE DATA: ' + error)
 });
*/