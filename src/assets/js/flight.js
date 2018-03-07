var viewer = new Cesium.Viewer('cesiumContainer');
viewer.imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
        url : 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
    });
var terrainProvider = viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
		url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
    });

function createModel(url, p, o) { // A fuction that allows you to create a plane with model from url, position from p, and orientation from o
    var entity = viewer.entities.add({ // Adding entity to Cesium Viewer
        name : url, // A human readable name to display to users
        position : p,
        orientation : o,
        model : { // A model to associate with this entity
            uri : url, // A string Property specifying the URI of the glTF asset
            scale : 0.4, // A uniform scale applied to this model
    		minimumPixelSize : 75 // The approximate minimum pixel size of the model regardless of zoom
        }
    });
    viewer.trackedEntity = entity; // Camera tracking the created entity
    return entity;
}

function createPath(p) { // A function that allows you to create a path with position from p
	var ePath = viewer.entities.add({ // Adding entity to Cesium Viewer
	  position : p,
	  path : { // A path to associate with this entity
		  	material : new Cesium.PolylineOutlineMaterialProperty({ // A Property specifying the material used to draw the path
	            color : Cesium.Color.WHITE, // Color of the line
	            outlineWidth : 2, // Width in pixels
	            outlineColor : Cesium.Color.WHITE.withAlpha(.5) // Color of the Outline
	        }),
			width : 3, // A numeric Property specifying the width in pixels
			leadTime : 300, // A Property specifying the number of seconds in front the object to show
			trailTime : 5 // A Property specifying the number of seconds behind of the object to show
		}
	})
	return ePath;
}

function createExceedancePath(p,c) { // A function that allows you to create an path for exceedances with position p and color c
	var ePath = viewer.entities.add({
	  position : p,
	  path : { // A path to associate with this entity
		  	material : new Cesium.PolylineOutlineMaterialProperty({ // Specifying the material used to draw the path
	            color : c,
	            outlineWidth : 2, // Outline width in pixels
	            outlineColor : c.withAlpha(.5) // Color of the outline
	        }),
			width : 10, // Width in pixels
			leadTime : 300, // Number of seconds ahead to draw the poth
			trailTime : 5 // Specifying the number of seconds behind the object to show
		}
	})
	return ePath;
}

// Necessary variables
var time = [];
var altitude = [];
var ias = [];
var heading = [];
var pitch = [];
var roll = [];
var latitude = [];
var longitude = [];
var position = [];
var hpr = [];
var orientation = [];
var timeSet = [];
var data = [];
var exceedance = [];
var exceedancePositionProperty = [];
var exceedancePositionProperty2 = [];
var exceedancePositionProperty3 = [];
var exceedancePath = [];
var exceedancePath2 = [];
var exceedancePath3 = [];
var exceedanceEnd = false;
var exceedanceEnd2 = false;
var exceedanceEnd3 = false;
var exceedanceCount = 0;
var exceedanceCount2 = 0;
var exceedanceCount3 = 0;
var start = viewer.clock.startTime; // Start is defined by the current system time
var positionProperty = new Cesium.SampledPositionProperty(); // A Property whose value is interpolated for a given time from the provided set of samples and specified interpolation algorithm and degree, which is also a positionProperty
positionProperty.setInterpolationOptions({
    interpolationDegree : 3, // The desired degree of interpolation
    interpolationAlgorithm : Cesium.LagrangePolynomialApproximation // Using Lagrange for interpolation
});
var orientationProperty = new Cesium.SampledProperty(Cesium.Quaternion); // A Property whose value is interpolated for a given time from the provided set of samples and specified interpolation algorithm and degree, which is a Quaternion
orientationProperty.setInterpolationOptions({
    interpolationDegree : 3, // The desired degree of interpolation
    interpolationAlgorithm : Cesium.LagrangePolynomialApproximation // Using Lagrange for interpolation
});
Cesium.loadText('./assets/data/testData.csv').then(function(text) { // Loading data from testData.csv
	data = text.split(','); // Splitting testData by ','
	var j = 0;
	//Parsing through the data and grabbing necessary information
	for(var i = 410; i < data.length - 1; i+=41) {
		altitude[j] = parseFloat(data[i+5]);
		ias[j] = parseFloat(data[i+6]); //  indicated air speed
		heading[j] = parseFloat(data[i+9]);
		pitch[j] = -parseFloat(data[i+11]);
		roll[j] = -parseFloat(data[i+12]);
		latitude[j] = parseFloat(data[i+19]);
		longitude[j] = parseFloat(data[i+20]);
		position[j] = new Cesium.Cartesian3.fromDegrees(longitude[j], latitude[j], altitude[j] - 611); // Defines position in Cartesian3 (in degrees) coordinates from longitude, latitude, and position (subtracting 611 from position because of height from sealevel and model height)
		hpr[j] = new Cesium.HeadingPitchRoll.fromDegrees(heading[j] + 90, pitch[j], roll[j]); // Defines hpr in a HeadingPitchRoll (in degrees) with heading (adding 90 to heading because model was 90 degrees off), pitch, and roll
		orientation[j] = new Cesium.Transforms.headingPitchRollQuaternion(position[j], hpr[j]); // Defines orienation in a Quaternion tranformation with position and hpr
		timeSet[j] = Cesium.JulianDate.addSeconds(start, j, new Cesium.JulianDate()); // Creates a set of times starting from start(current time) and increasing by 1 second each time
		positionProperty.addSample(timeSet[j], position[j]); // Adds a new sample to positionProperty of timeSet and position
		orientationProperty.addSample(timeSet[j], orientation[j]); // Adds a new sample to orientationProperty of timeSet and orienation
		//polyline collection
		if(ias[j] > 100){
			if(exceedanceEnd == false){
				exceedancePositionProperty[exceedanceCount] = new Cesium.SampledPositionProperty();
				exceedancePositionProperty[exceedanceCount].setInterpolationOptions({
				    interpolationDegree : 3,
				    interpolationAlgorithm : Cesium.LagrangePolynomialApproximation
				});
				exceedanceEnd = true;
			}
			exceedancePositionProperty[exceedanceCount].addSample(timeSet[j], position[j]);
		}else if (exceedanceEnd == true){
			exceedancePath[exceedanceCount] = createExceedancePath(exceedancePositionProperty[exceedanceCount], Cesium.Color.RED);
			exceedanceCount++;
			exceedanceEnd = false;
		}
		if(altitude[j] > 3000 + 840){
			if(exceedanceEnd2 == false){
				exceedancePositionProperty2[exceedanceCount2] = new Cesium.SampledPositionProperty();
				exceedancePositionProperty2[exceedanceCount2].setInterpolationOptions({
				    interpolationDegree : 3,
				    interpolationAlgorithm : Cesium.LagrangePolynomialApproximation
				});
				exceedanceEnd2 = true;
			}
			exceedancePositionProperty2[exceedanceCount2].addSample(timeSet[j], position[j]);
		}else if (exceedanceEnd2 == true){
			exceedancePath2[exceedanceCount2] = createExceedancePath(exceedancePositionProperty2[exceedanceCount2], Cesium.Color.BLUE);
			exceedanceCount2++;
			exceedanceEnd2 = false;
		}
		if(roll[j] <= -10 || roll[j] >= 10){
			if(exceedanceEnd3 == false){
				exceedancePositionProperty3[exceedanceCount3] = new Cesium.SampledPositionProperty();
				exceedancePositionProperty3[exceedanceCount3].setInterpolationOptions({
				    interpolationDegree : 3,
				    interpolationAlgorithm : Cesium.LagrangePolynomialApproximation
				});
				exceedanceEnd3 = true;
			}
			exceedancePositionProperty3[exceedanceCount3].addSample(timeSet[j], position[j]);
		}else if (exceedanceEnd3 == true){
			exceedancePath3[exceedanceCount3] = createExceedancePath(exceedancePositionProperty3[exceedanceCount3], Cesium.Color.GREEN);
			exceedanceCount3++;
			exceedanceEnd3 = false;
		}
		j++;
	}
}).otherwise(function(err){
	console.log(err);
});
var entityPath = createPath(positionProperty);
var modelEntity = createModel('./assets/data/Cessna172.glb', positionProperty, orientationProperty);

document.getElementById('plane1').onclick = function() {
  modelEntity.model.uri = './assets/data/Cessna172.glb';
};

document.getElementById('plane2').onclick = function() {
  modelEntity.model.uri = './assets/data/CesiumMilkTruck.glb';
};

//Sets the live HTML table with info about the flight currently
var alt = document.getElementById("altitude");
var as = document.getElementById("airSpeed");
var lat = document.getElementById("latitude");
var long = document.getElementById("longitude");
window.setInterval(function update(orientation) {
	var currTime = viewer.clock.currentTime;
	var startTime = viewer.clock.startTime;
	var diff = parseInt(Cesium.JulianDate.secondsDifference(currTime, startTime));
	alt.innerHTML = parseInt(altitude[diff]-840);
	as.innerHTML = ias[diff];
	lat.innerHTML = latitude[diff];
	long.innerHTML = longitude[diff];
}, 100);
/*
document.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
        case 85:
            viewer.zoomTo(modelEntity, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90), 500));
            //viewer.trackedEntity = modelEntity;
            break;
        case 73:
            viewer.zoomTo(modelEntity, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-90), Cesium.Math.toRadians(-15), 1000));
            //viewer.trackedEntity = modelEntity;
            break;
        default:
    }
});
*/
