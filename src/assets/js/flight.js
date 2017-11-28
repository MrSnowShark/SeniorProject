//********************************************************************************************
var viewer = new Cesium.Viewer('cesiumContainer');
viewer.imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
        url : 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
    });
var terrainProvider = viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
		url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
    });

function createModel(url, p, o) {
    var entity = viewer.entities.add({
        name : url,
        position : p,
        orientation : o,
        model : {
            uri : url,
            asynchronous : true,
            scale : 0.4,
    		minimumPixelSize : 75
        }
    });
    viewer.trackedEntity = entity;
    return entity;
}

function createPath(p) {
	var ePath = viewer.entities.add({
	  position : p,
	  path : {
		  	material : new Cesium.PolylineOutlineMaterialProperty({
	            color : Cesium.Color.WHITE,
	            outlineWidth : 2,
	            outlineColor : Cesium.Color.WHITE.withAlpha(.5)
	        }),
			width : 3,
			leadTime : 300,
			trailTime : 5
		}
	})
	return ePath;
}

function createExceedancePath(p) {
	var ePath = viewer.entities.add({
	  position : p,
	  path : {
		  	material : new Cesium.PolylineOutlineMaterialProperty({
	            color : Cesium.Color.RED,
	            outlineWidth : 2,
	            outlineColor : Cesium.Color.RED.withAlpha(.5)
	        }),
			width : 10,
			leadTime : 300,
			trailTime : 5
		}
	})
	return ePath;
}

var time = [];
var altitude = [];
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
var exceedancePath = [];
var exceedanceEnd = false;
var exceedanceCount = 0;
var start = viewer.clock.startTime;
var positionProperty = new Cesium.SampledPositionProperty();
positionProperty.setInterpolationOptions({
    interpolationDegree : 3,
    interpolationAlgorithm : Cesium.LagrangePolynomialApproximation
});
var orientationProperty = new Cesium.SampledProperty(Cesium.Quaternion);
/*
orientationProperty.setInterpolationOptions({
    interpolationDegree : 3,
    interpolationAlgorithm : Cesium.LagrangePolynomialApproximation
});
*/
Cesium.loadText('./assets/data/testData.csv').then(function(text) {
	data = text.split(',');
	var j = 0;
	for(var i = 410; i < data.length - 1; i+=41) {
		altitude[j] = parseFloat(data[i+5]);
		heading[j] = parseFloat(data[i+9]);
		pitch[j] = -parseFloat(data[i+11]);
		roll[j] = -parseFloat(data[i+12]);
		latitude[j] = parseFloat(data[i+19]);
		longitude[j] = parseFloat(data[i+20]);
		position[j] = new Cesium.Cartesian3.fromDegrees(longitude[j], latitude[j], altitude[j] - 611);
<<<<<<< HEAD
	for(var i = 0; i < data.length - 1; i+=11) {
		altitude[j] = parseFloat(data[i+2]);
		heading[j] = parseFloat(data[i+6]);
		pitch[j] = -parseFloat(data[i+8]);
		roll[j] = parseFloat(data[i+9]);
		latitude[j] = parseFloat(data[i+10]);
		longitude[j] = parseFloat(data[i+11]);
		position[j] = new Cesium.Cartesian3.fromDegrees(longitude[j], latitude[j], altitude[j]-610); // Subtract 610 from altitude because of sea level height and model heights *NOT FINAL*
=======
>>>>>>> e133b302e1e9bb0363c90eb88ce1e29234b0c089
		hpr[j] = new Cesium.HeadingPitchRoll.fromDegrees(heading[j] + 90, pitch[j], roll[j]);
		orientation[j] = new Cesium.Transforms.headingPitchRollQuaternion(position[j], hpr[j]);
		timeSet[j] = Cesium.JulianDate.addSeconds(start, j, new Cesium.JulianDate());
		positionProperty.addSample(timeSet[j], position[j]);
		orientationProperty.addSample(timeSet[j], orientation[j]);
		//polyline collection
		if(altitude[j] > 850){ 
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
			exceedancePath[exceedanceCount] = createExceedancePath(exceedancePositionProperty[exceedanceCount]);
			exceedanceCount++;
			exceedanceEnd = false;
		}
		j++;
	}
}).otherwise(function(err){
	console.log(err);
});

var modelEntity = createModel('./assets/data/Cessna172.glb', positionProperty, orientationProperty);
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