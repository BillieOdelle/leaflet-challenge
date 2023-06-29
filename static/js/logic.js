let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<div>
      <h3>Place: ${feature.properties.place}</h3>
      <hr>
      <p>Magnitude: ${feature.properties.mag}</p>
      <hr>
      <p>Longitude: ${feature.geometry.coordinates[0]}</p>
      <p>Latitude: ${feature.geometry.coordinates[1]}</p>
      <p>Depth: ${feature.geometry.coordinates[2]}</p>
    </div>`);
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      let magnitude = feature.properties.mag;
      let depth = feature.geometry.coordinates[2];
      let radius = markerSize(magnitude);
      let fillColor = getColor(depth);
      let legend = L.control({ position: 'bottomright' });

      return L.circleMarker(latlng, {
        radius: radius,
        fillColor: fillColor,
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    }
  });

  function markerSize(mag) {
    if (mag < -0.0) {
      return Math.sqrt(mag) * 0.05;
    } else if (mag < 2) {
      return Math.sqrt(mag) * 0.1;
    } else if (mag < 5) {
      return Math.sqrt(mag) * 3;
    } else {
        return Math.sqrt(mag) * 5;
      }
      
  }

  function getColor(depth) {
    if (depth < 10) {
      return "#E1BEE7";
    } else if (depth < 30) {
      return "#CE93D8";
    } else if (depth < 50) {
      return "#BA68C8";
    } else if (depth < 70) {
      return "#AB47BC";
    } else if (depth < 90) {
      return "#9C2780";
    } else {
        return "#8E24AA";
      }
      
  }

  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  let worldMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "World Map": worldMap,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

// Add the legend to the map.
  //legend.addTo(myMap);

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      21.76, 78.87
    ],
    zoom: 3,
    layers: [worldMap, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  let legend = L.control({ position: 'bottomright' });
  // Define the legend content.
  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let grades = [10, 10-30, 30-50, 50-70, 70-90, 90("+")];
    let labels = [];

  // Loop through the depth ranges and generate labels.
  for (let i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};

  legend.addTo(myMap);
}