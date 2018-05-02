<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <title>NGAFID</title>
    <script type="text/javascript" src="{{ asset('Cesium/Apps/Sandcastle/Sandcastle-header.js') }}"></script>
    <script type="text/javascript" src="{{ asset('Cesium/ThirdParty/requirejs-2.1.9/require.js') }}"></script>
    <script type="text/javascript">
        require.config({
            baseUrl: "{{ asset('Cesium/Source') }}",
            waitSeconds: 60
        });
    </script>
</head>
<body class="sandcastle-loading" data-sandcastle-bucket="bucket-requirejs.html">
    <style>
        @import url("{{ asset('Cesium/Apps/Sandcastle/templates/bucket.css') }}");
        
      #exceedance1 {
        background-color: red;
      }
      
      #controlPanel {
          position: absolute;
          top: 5px;
          left: 5px;
          border-radius: 5px;
      }
      #options{
          position: absolute;
          top: 5px;
          left: 5px;
      }
      #flightInfo{
          position: relative;
          top: 200px;
          left: 5px;
          border-radius: 5px;
          padding: 5px 8px;
          background: rgba(42, 42, 42, 0.7);
      }

      #controlPanel1 {
          position: absolute;
          top: 5px;
          right: 5px;
          border-radius: 5px;
      }

      #legend{
          white-space: nowrap;
          overflow: auto;
          position: absolute;
          top: 40px;
          right: 0px;
          border-radius: 5px;
          padding: 5px 8px;
          background: rgba(42, 42, 42, 0.7);
      }

      label {
        cursor: pointer;
      }
      label:hover span {
        text-decoration: underline;
      }

    </style>
    <div id="cesiumContainer" class="fullSize"></div>

        <div id="cesiumContainer" class="fullSize"></div>
        <div id="loadingOverlay">
            <h1>Loading...</h1>
        </div>
        <div id="toolbar"></div>
		  <div class="row">

			  <!--THE CESIUM CONTAINER-->
			  <div id="cesiumContainer" class="col-md-12"></div>
			  <!--THE CESIUM CONTAINER-->
			  <div id="controlPanel">
				  <!--Live HTML table WIP-->
				  <div id="flightInfo" style="color:Grey">
					  <ul class="list-group">
						  <li class="list-group-item">
							  <span id="altitude" class="pull-right"></span
						  </li>
					  </ul>
					  <ul class="list-group">
						  <li class="list-group-item">
							  <span id="airSpeed" class="pull-right"></span>
						  </li>
					  </ul>
					  <ul class="list-group">
						  <li class="list-group-item">
							  <span id="latitude" class="pull-right"></span>
						  </li>
					  </ul>
					  <ul class="list-group">
						  <li class="list-group-item">
							  <span id="longitude" class="pull-right"></span>
						  </li>
					  </ul>
				  </div>
			</div>

		  <div class="row1">
			  <div id="controlPanel1">
				  <!--Live HTML table WIP-->
				  <div id="legend" style="color:Grey;">
					  <ul class="list-group" style="color: red">
						  <li class="list-group-item">
							  <div id="exceedance1"></div>
								  Excessive IAS
						  </li>
					  </ul>
					  <ul class="list-group" style="color: blue">
						  <li class="list-group-item">
							  <div id="exceedance2"></div>
								  Excessive Altitude
						  </li>
					  </ul>
					  <ul class="list-group" style="color: green">
						  <li class="list-group-item">
							  <div id="exceedance3"></div>
								  Excessive Roll
						  </li>
					  </ul>
				  </div>
			  </div>
		  </div>

    <script id="cesium_sandcastle_script">
        function startup(Cesium) {
            Cesium.BingMapsApi.defaultKey = 'AihImmOR6pfmLJCWML_PiheiY1etbNFlXAItDEC89jvF34Y2FGLuYu8LZqSz4Yzz';
            "use strict";

            var viewer = new Cesium.Viewer('cesiumContainer', {
				requestRenderMode : true,
				maximumRenderTimeChange : Infinity
			});
			viewer.scene.debugShowFramesPerSecond = true;
            
            
			
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
			
			var obj = "<?php echo $data ?>";
			
			var data = obj.split(' ');
			
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
			var exceedance = [];
			var exceedancePositionProperty = [];
			var exceedancePath = [];
			var exceedanceEnd = false;
			var exceedanceCount = 0;
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
			var j = 0;
			//Parsing through the data and grabbing necessary information
			data.forEach(function(element) {
				var points = element.split(',');
				latitude[j] = parseFloat(points[0]);
				longitude[j] = parseFloat(points[1]);
				altitude[j] = parseFloat(points[2]);
				heading[j] = parseFloat(points[3]);
				pitch[j] = parseFloat(points[4]);
				roll[j] = parseFloat(points[5]);
				position[j] = new Cesium.Cartesian3.fromDegrees(longitude[j], latitude[j], altitude[j] - 840); // Defines position in Cartesian3 (in degrees) coordinates from longitude, latitude, and position (subtracting 611 from position because of height from sealevel and model height)
				//hpr[j] = new Cesium.HeadingPitchRoll.fromDegrees(heading[j], pitch[j], roll[j], hpr[j]); // Defines hpr in a HeadingPitchRoll (in degrees) with heading (adding 90 to heading because model was 90 degrees off), pitch, and roll
				//~ orientation[j] = new Cesium.Transforms.headingPitchRollQuaternion(position[j], hpr[j]); // Defines orienation in a Quaternion tranformation with position and hpr
				timeSet[j] = Cesium.JulianDate.addSeconds(start, j, new Cesium.JulianDate()); // Creates a set of times starting from start(current time) and increasing by 1 second each time
				positionProperty.addSample(timeSet[j], position[j]); // Adds a new sample to positionProperty of timeSet and position
				//~ orientationProperty.addSample(timeSet[j], orientation[j]); // Adds a new sample to orientationProperty of timeSet and orienation
				//polyline collection
				/*
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
				*/
				data.shift();
				j++;
			});
			//console.log(roll);
			var entityPath = createPath(positionProperty);
			var modelEntity = createModel('../../Cesium/Apps/SampleData/models/CesiumAir/Cesium_Air.bgltf', positionProperty, orientationProperty);
			
			//Sets the live HTML table with info about the flight currently
			var alt = document.getElementById("altitude");
			var ias = document.getElementById("airSpeed");
			var lat = document.getElementById("latitude");
			var long = document.getElementById("longitude");
			window.setInterval(function update(orientation) {
				var currTime = viewer.clock.currentTime;
				var startTime = viewer.clock.startTime;
				var diff = parseInt(Cesium.JulianDate.secondsDifference(currTime, startTime));
				alt.innerHTML = parseInt(altitude[diff]-840);
				ias.innerHTML = ias[diff];
				lat.innerHTML = latitude[diff];
				long.innerHTML = longitude[diff];
			}, 100);
			
			Sandcastle.addDefaultToolbarMenu([{
				text: 'Cessna 172',
				onselect: function() {
					modelEntity.model.uri = '../../Cesium/Apps/SampleData/models/CesiumAir/Cesium_Air.bgltf';
				}
			}, {
				text: 'Milk Truck',
				onselect: function() {
					modelEntity.model.uri = '../../Cesium/Apps/SampleData/models/CesiumMilkTruck/CesiumMilkTruck.bgltf';
				}
			}], 'toolbar');
			
            //Add button to view the path from the top down
            Sandcastle.addToolbarButton('Top Down View', function () {
                viewer.trackedEntity = undefined;
                viewer.zoomTo(modelEntity, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-88.9), 30000));
            });

            //Add button to view the path from the side
            Sandcastle.addToolbarButton('Side View', function () {
                viewer.trackedEntity = undefined;
                viewer.zoomTo(modelEntity, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-90), Cesium.Math.toRadians(-15), 7500));
            });

            //Add button to track the entity as it moves
            Sandcastle.addToolbarButton('Focus Aircraft', function () {
                viewer.trackedEntity = modelEntity;
            });

            //Sandcastle_End
            Sandcastle.finishedLoading();
        }

        if (typeof Cesium !== "undefined") {
            startup(Cesium);
        } else if (typeof require === "function") {
            require(["Cesium"], startup);
        }
    </script>

</body>

</html>
