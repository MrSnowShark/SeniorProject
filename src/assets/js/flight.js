//********************************************************************************************
var viewer = new Cesium.Viewer('cesiumContainer');
viewer.imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
        url : 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
    });
var terrainProvider = viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
		url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
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
			leadTime : 600,
			trailTime : 5
		}
	})
	return ePath;
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
var positionProperty = new Cesium.SampledPositionProperty();
positionProperty.setInterpolationOptions({
    interpolationDegree : 3,
    interpolationAlgorithm : Cesium.LagrangePolynomialApproximation,
    number : 0.25
});

Cesium.loadText('./assets/data/tableData2.csv').then(function(text) {
	data = text.split(',');
	var j = 0;
	for(var i = 0; i < data.length - 1; i+=11) {
		//time[j] = parseFloat(data[i+1]/1000);
		altitude[j] = parseFloat(data[i+2]).toFixed();
		//ias[j] = parseFloat(data[i+3]);
		//vas[j] = parseFloat(data[i+4]);
		//tas[j] = parseFloat(data[i+5]);
		//heading[j] = parseFloat(data[i+6]);
		//course[j] = parseFloat(data[i+7]);
		//pitch[j] = -parseFloat(data[i+8]);
		//roll[j] = parseFloat(data[i+9]);
		latitude[j] = parseFloat(data[i+10]);
		longitude[j] = parseFloat(data[i+11]);
		position[j] = new Cesium.Cartesian3.fromDegrees(longitude[j], latitude[j], altitude[j] - 610); // Subtract 610 from altitude because of sea level height and model heights
		//hpr[j] = new Cesium.HeadingPitchRoll.fromDegrees(heading[j] + 90, pitch[j], roll[j]);
		//orientation[j] = new Cesium.Transforms.headingPitchRollQuaternion(position[j], hpr[j]);
		timeSet[j] = Cesium.JulianDate.addSeconds(start, j, new Cesium.JulianDate());
		positionProperty.addSample(timeSet[j],position[j]);
		j++;
	}
}).otherwise(function(err){
	console.log(err);
});
var orientationProperty = new Cesium.VelocityOrientationProperty(positionProperty);
var entityPath = createPath(positionProperty);
var modelEntity = createModel('./assets/data/Cessna172.glb', positionProperty, orientationProperty);