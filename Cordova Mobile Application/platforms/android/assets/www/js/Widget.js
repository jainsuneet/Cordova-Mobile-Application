/**
 * http://usejsdoc.org/
 */
$.ajaxSetup({async:false});
$.getScript("jqwidgets/jqxcore.js");
$.getScript("jqwidgets/jqxdata.js");
$.getScript("jqwidgets/jqxinput.js");
$.getScript("jqwidgets/jqxbuttons.js");
$.ajaxSetup({async:true});
var osmMap = null;
var MapWidget = (function(){
	
	
			return{
				tabConatiner:null,
				templateStr:null,
				theme:"mobile",
				map:null,
				nodesData:null,
				source:[],
				srcLocation:null,
				destLocation:null,
				appConfig:{
					sEndpoint:"http://192.168.0.104:3000/services",
					nodesService:"/nodes",
					pathService:"/path"
				},
				init:function(){
					var thisRef = this;
					var src = document.getElementById("mapFrame").src;
					document.getElementById("search").onclick=function(){
						
						$.get(thisRef.appConfig.sEndpoint+thisRef.appConfig.pathService+"?src="+thisRef.srcLocation+"&dest="+thisRef.destLocation).done(function(data){
							//alert(JSON.stringify(data));
							//thisRef.addRoute(data);
							//.addRoute(data);
							query="?points=";
							for(var i=0;i<data.points.length;i++){
								var temp=JSON.stringify([data.points[i]['lng'],data.points[i]['lat']])
								if(i==data.points.length-1){
									query=query+temp;
								}else{
									query=query+temp+"|";
								}
							}
							document.getElementById("mapFrame").src=src+query;
							
						}).fail(function(err){
							alert(JSON.stringify(err));
						})
					//alert(thisRef.srcLocation);
					//alert(thisRef.destLocation);
				 }
				},
				prepareWidgets:function(){
					 var thisRef = this; 
					 //alert(JSON.stringify(thisRef.nodesData[0].street['meta_data']));
					 for(var i=0;i<thisRef.nodesData.length;i++){
						 //alert(JSON.stringify(record));
						 var temp = {"label":thisRef.nodesData[i].street['meta_data'].name,"value":thisRef.nodesData[i].street.osmId};
						 thisRef.source.push(temp)
					 }
					 $("#source").jqxInput({ theme: thisRef.theme, placeHolder: "Select Source",minLength: 1, source:thisRef.source });
					 $("#destination").jqxInput({ theme: thisRef.theme, placeHolder: "Select Destination", minLength: 1, source:thisRef.source  });
					 //$("#submit").jqxButton({ theme: thisRef.theme, enableHover: false, width: '80%' });
					 $("#source").on("select",function(event){
						 var item = event.args.item;
						 thisRef.srcLocation = item.value;
					 });
					 
					 $("#destination").on("select",function(event){
						 var item = event.args.item;
						 thisRef.destLocation = item.value;
					 });
					 
				},
				invokeNodesService:function(){
					var thisRef = this;
					$.get(thisRef.appConfig.sEndpoint+thisRef.appConfig.nodesService).done(function(data){
						thisRef.nodesData = data;
						thisRef.prepareWidgets();
					}).fail(function(err){
						alert(JSON.stringify(err));
					})
				},
				plotMap:function(){
					//alert(document.getElementById("osmMap"));
					//alert("called");
					  osmMap = L.map('osmMap',{
						    center: [48.777106, 9.180769],
						    zoom: 15
						    });

						    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
						    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'+'&copy; <a href="http://www.mapbox.com">MapBox</a>'+' contributors'
						    }).addTo(osmMap);
					 //alert(this.map)
				    //document.getElementById("osmMap").style.dsiplay="block";
				    //L.Util.requestAnimFrame(thisRef.map.invalidateSize,thisRef.map,!1,thisRef.map._container);
				},
				addRoute:function(data){
					var points = [];
					var polyPoints =[];
					var wayPoints = [];
					data=data.substr(data.indexOf("=")+1)
					//alert(data);
					points=data.split("|");
					for(var i=0;i<points.length;i++){
						var temp = JSON.parse(points[i]);
						polyPoints.push(new L.LatLng(temp[0],temp[1]))
						wayPoints.push(L.latLng(temp[0],temp[1] ));
					}
					
						
					
					var polylineOptions = {
				               color: 'blue',
				               weight: 6,
				               opacity: 0.9
				             };
					
				      var polyline = new L.Polyline(polyPoints, polylineOptions);
				         osmMap.addLayer(new L.marker(polyPoints[0]));
				         osmMap.addLayer(new L.marker(polyPoints[polyPoints.length-1]));
				         var mapBox=L.Routing.mapbox("pk.eyJ1IjoiamFpbnN1bmVldCIsImEiOiJjaW5lbHZzN3AwMDdtd2FseHQ3eWlxZ29qIn0.DlZbx42B5iRDNDO65h6phA",{
				 			profile: 'mapbox.cycling'
						 });
				         var control = L.Routing.control({
								waypoints: wayPoints,
								//geocoder: L.Control.Geocoder.nominatim(),s
								 /*router: L.Routing.graphHopper("d6d137ea-923d-45c5-bd63-bfccf01b6b50" , {
							        urlParameters: {
							            vehicle: 'bike'
							        }
								}),*/
								router:mapBox,
							    routeWhileDragging: true,
							    reverseWaypoints: true,
							    showAlternatives: true,
							    altLineOptions: {
							        styles: [
							            {color: 'blue', opacity: 0.15, weight: 9},
							            {color: 'blue', opacity: 0.8, weight: 6},
							            {color: 'blue', opacity: 0.5, weight: 2}
							        ]
							    }
							}).addTo(osmMap);
				         L.Routing.errorControl(control).addTo(osmMap);
				         osmMap.addLayer(polyline);
				         osmMap.fitBounds(polyline.getBounds());
						
				},
			};
})();