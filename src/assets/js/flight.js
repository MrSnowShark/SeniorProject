//********************************************************************************************
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

function createModel(url, p, o) {
    //viewer.entities.removeAll();
    var entity = viewer.entities.add({
        name : url,
        position : p,
        orientation : o,
        model : {
            uri : url,
            asynchronous : true,
            scale : 0.5,
    		minimumPixelSize : 20
        }
    });
    //viewer.trackedEntity = entity;
    return entity;
}

var time = [];
var altitude = [];
var ias = [];
var vas = [];
var tas = [];
var heading = [];
var course = [];
var pitch = [];
var roll = [];
var latitude = [];
var longitude = [];
var position = [];
var hpr = [];
var orientation = [];
var timeSet = [];
var data = [];
var start = viewer.clock.startTime;

Cesium.loadText('./assets/data/tableData2.csv').then(function(text) {
	data = text.split(',');
	var j = 0;
	for(var i = 0; i < data.length - 1; i+=11) {
		time[j] = parseFloat(data[i+1]/1000);
		altitude[j] = parseFloat(data[i+2]);
		ias[j] = parseFloat(data[i+3]);
		vas[j] = parseFloat(data[i+4]);
		tas[j] = parseFloat(data[i+5]);
		heading[j] = parseFloat(data[i+6]);
		course[j] = parseFloat(data[i+7]);
		pitch[j] = -parseFloat(data[i+8]);
		roll[j] = parseFloat(data[i+9]);
		latitude[j] = parseFloat(data[i+10]);
		longitude[j] = parseFloat(data[i+11]);
		position[j] = new Cesium.Cartesian3.fromDegrees(longitude[j], latitude[j], altitude[j]-610);
		hpr[j] = new Cesium.HeadingPitchRoll.fromDegrees(heading[j] + 90, pitch[j], roll[j]);
		orientation[j] = new Cesium.Transforms.headingPitchRollQuaternion(position[j], hpr[j]);
		timeSet[j] = Cesium.JulianDate.addSeconds(start, time[j], new Cesium.JulianDate());
		//console.log(timeSet[j]);
		j++;
	}
}).otherwise(function(err){
	console.log(err);
});
/*
var positionProperty = new Cesium.SampledProperty();
positionProperty.addSamples(position);
var entityPath = viewer.entities.add({
  position : positionProperty,
  orientation : new Cesium.VelocityOrientationProperty(positionProperty),
  path : {
	    show : true,
	    leadTime : 300,
	    trailTime : 5,
	    width : 3,
	    resolution : 1,
	    material : {
			polylineOutline: {
				color: { rgba : [255, 0, 255, 255] }
			}
		},
	}
});
*/
var modelEntity = createModel('./assets/data/Cessna172.glb', position[0], orientation[0]);
var k = 0;
window.setInterval(function update() {
	//modelPath.position = position[k];
	modelEntity.position = position[k];
	modelEntity.orientation = orientation[k];
	
	var currTime = viewer.clock.currentTime;
	var startTime = viewer.clock.startTime;
	var diff = parseInt(Cesium.JulianDate.secondsDifference(currTime, startTime));
	k++;
}, 1000);

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
	var theEntity = pathEntity;
	if(theEntity.show) {
		theEntity.show = false;
		console.log('Path hidden');
	} else {
		theEntity.show = true;
		console.log('Path shown');
	}
}

function changeLead(x) {
	var theEntity = pathEntity;
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
	var theEntity = pathEntity;
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