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
			material : {
				polylineOutline: {
					color: { rgba : [255, 0, 255, 255] }
				}
			},
			width : 3,
			leadTime : 300,
			trailTime : 5
		}
	})
	return ePath;
}
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
		hpr[j] = new Cesium.HeadingPitchRoll.fromDegrees(heading[j] + 90, pitch[j], roll[j]);
		orientation[j] = new Cesium.Transforms.headingPitchRollQuaternion(position[j], hpr[j]);
		timeSet[j] = Cesium.JulianDate.addSeconds(start, j, new Cesium.JulianDate());
		positionProperty.addSample(timeSet[j], position[j]);
		orientationProperty.addSample(timeSet[j], orientation[j]);
		j++;
	}
}).otherwise(function(err){
	console.log(err);
});
var entityPath = createPath(positionProperty);
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