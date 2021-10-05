
var map, svg, g;
//L.map(<String> id, <Map options> options?)
// Sets the view of the map (geographical center and zoom)
// "LatLng" means latitude and longitude; "L" means leaflet.
// {s} - a available subdomains
// {z} - zoom level, 
// {x} and {y} - tile coordinates. 
map = new L.Map('map')
           .setView(new L.LatLng(22.8, 121.9), 7)
           .addLayer(new L.TileLayer('http://{s}.tile.cloudmade.com/ae2dc46faa384973b408b2467d727490/998/256/{z}/{x}/{y}.png'));
//d3.select(selector):
// ~Selects the first element that matches the specified selector string
//selection.append(type):
// ~If the specified type is a string, appends a new element of this type (tag name) as the last child of each selected element.
//"Panes" are DOM elements used to control the ordering of layers on the map.
// You can access panes with "map.getPane" or "map.getPanes" methods.
//overlayPane(): Pane for vectors (Paths, like Polylines and Polygons), ImageOverlays and VideoOverlays 
svg = d3.select(map.getPanes().overlayPane)
        .append('svg');
g = svg.append('g');

//d3.json(input[, init]): Fetches the JSON file at the specified input URL.
d3.json('SEAN_TAIWAN.json', function(collection){
  console.log('no.d3.json_function(collection)');
  var reset, project, bounds, path, feature;

  reset = function(){
    console.log('-no.reset()');
    var bottomLeft, topRight;
    bottomLeft = project(bounds[0]);
    topRight = project(bounds[1]);
    svg.attr({
        width: topRight[0] - bottomLeft[0],
        height: bottomLeft[1] - topRight[1]
      })
       .style('margin-left', bottomLeft[0] + 'px')
       .style('margin-top', topRight[1] + 'px');
    g.attr('transform', 'translate(' + -bottomLeft[0] + ',' + -topRight[1] + ')');
    return feature.attr('d', path);
  };

  
  // Change geographical coordinates to pixel coordinate.
  project = function(x){
    //console.log('-no.project()');
    var point;
    //# latLngToLayerPoint(<LatLng> latlng): 
    // ~Given a geographical coordinate, returns the corresponding pixel coordinate relative to the origin pixel(top left point of the map layer).
    point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
    return [point.x, point.y];
  };
  
  // Compute the latitude-longitude bounding box ~ for a given feature.
  bounds = d3.geo.bounds(collection);


  // Renders the given object(GeoJSON feature or geometry ) 
  //  &Project longitude-latitude points to pixel(or projected) points. Returns a new array [x, y]
  path = d3.geo.path().projection(project);
  
  //selection.data - join elements to data.
  //selection.enter - get the enter selection (data missing elements).
  //selection.append - create, append and select new elements.
  feature = g.selectAll('path').data(collection.features).enter().append('path');
    //console.log('feature: ' + feature);
    //console.dir(feature);
  
  //Map state change events - viewreset: 
  // ~Fired when the map needs to redraw its content (this usually happens on map zoom or load). 
  map.on('viewreset', function(){
    console.log('execute map.on');
    console.log('reseting');
    return reset();
  });
  
  return reset();
});
var videoIds = [];
var currentVideoIndex = 0;
var popup = L.popup();
function onMapClick2(e) {
    console.debug(e);
    getCityName(e);
}


function getYoutubeURL(e, cityName){
  console.log("no.getYoutubeURL()");
  console.dir(getYoutubeURL);
  
  var returned_url = "https://www.youtube.com/embed/";
  var Query = encodeURI(cityName);
  if(cityName == null){
    return;
  }
  key = "AIzaSyB1X9T2vZUGdPx8PAgxgHuRfwc-ztgQA4A";
  var url = "https://www.googleapis.com/youtube/v3/search?"+
            "&key="+key+
            "&part=id,snippet"+
            "&q="+Query+ 
            "&type=video";
  console.log(url);
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET',url);
  xhr.onload = function(){
    console.log("-no.xhr.onload()");
    var response = JSON.parse(this.responseText);
    console.dir(this);
    console.dir(response);

    var firstVideoId = response.items[0].id.videoId;
    var firstVideoTitle = response.items[0].snippet.title;
    var firstVideoTime = response.items[0].snippet.publishedAt;
    var firstVideoDate = firstVideoTime.substring(0,10);

    console.log(firstVideoTitle);
    videoIds = [];
    videoTitles = [];
    videoTimes = [];
    videoDates = [];

    currentVideoIndex = 0;

    for(i=0;i<response.items.length;i++){
      videoIds.push(response.items[i].id.videoId);
      videoTitles.push(response.items[i].snippet.title);
      videoTimes[i] = response.items[i].snippet.publishedAt;
      videoDates.push(videoTimes[i].substring(0,10));
    }
    console.log(videoDates[0]);
    popup.setLatLng(e.latlng)
       .setContent("<tr><button type=\"button\" onclick=\"videoLeftClick()\" style=\"margin-top: 10px;\"><</button><div class=\"popup-title\" style=\"display: inline;\">"+firstVideoTitle+" ("+firstVideoDate+")"+"</div><button type=\"button\" onclick=\"videoRightClick()\" style=\"float: right; margin-top: 10px;\">></button></tr><iframe src='https://www.youtube.com/embed/"+firstVideoId+"?rel=0&autoplay=1'; </iframe>")    
       .openOn(map);
    console.log("Video_Id = "+firstVideoId);
  }
  
  xhr.send();
}


function videoLeftClick(){
  console.log("no.videoLeftClick()");
  if(videoIds.length == 0){
    return;
  }
  if(currentVideoIndex == 0){
    currentVideoIndex = videoIds.length - 1;
  }else{
    currentVideoIndex--;
  }
  videoId = videoIds[currentVideoIndex];
  popup.setContent("<tr><button type=\"button\" onclick=\"videoLeftClick()\" style=\"margin-top: 10px;\"><</button><div class=\"popup-title\" style=\"display: inline;\">"+videoTitles[currentVideoIndex]+" ("+videoDates[currentVideoIndex]+")"+"</div><button type=\"button\" onclick=\"videoRightClick()\" style=\"float: right; margin-top: 10px;\">></button></tr><iframe src='https://www.youtube.com/embed/"+videoId+"?rel=0&autoplay=1'; </iframe>")    
       
}


function videoRightClick(){
  console.log("no.videoRightClick()");
  if(videoIds.length == 0){
    return;
  }
  if(currentVideoIndex >= videoIds.length -1){
    currentVideoIndex = 0;
  }else{
    currentVideoIndex++;
  }
  videoId = videoIds[currentVideoIndex];
  popup.setContent("<tr><button type=\"button\" onclick=\"videoLeftClick()\" style=\"margin-top: 10px;\"><</button><div class=\"popup-title\" style=\"display: inline;\">"+videoTitles[currentVideoIndex]+" ("+videoDates[currentVideoIndex]+")"+"</div><button type=\"button\" onclick=\"videoRightClick()\" style=\"float: right; margin-top: 10px;\">></button></tr><iframe src='https://www.youtube.com/embed/"+videoId+"?rel=0&autoplay=1'; </iframe>")    
   
}


function getCityName(e){
  console.log("no.getCityName()");
  var lat = e.latlng.lat;
  var lon = e.latlng.lng;
  var key = "AIzaSyANXEgTF4NqWIMckgBHJRYNGq2NDKEfIW8";
  var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lon+"&key="+key;
  xhr = new XMLHttpRequest();
  xhr.open('GET',url);
  xhr.onload = function(){
    console.log("-no.xhr.onload()");
    var response = JSON.parse(this.response);
    var cityName = response.results[0].address_components[2].short_name;
    console.dir(cityName);
    getYoutubeURL(e,cityName);
  }
  xhr.send();
}
map.on('click', onMapClick2);