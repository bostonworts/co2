var map, featureList, poiSearch = [];

$(document).on("click", ".feature-name", function(e) {
  sidebarClick(parseInt($(this).attr('id')));
});

function sidebarClick(id) {
  map.addLayer(poiLayer);
  var layer = markerClusters.getLayer(id);
  markerClusters.zoomToShowLayer(layer, function() {
    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
    layer.fire("click");
  });
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

/* Basemap Layers
   Example basemaps from Mapbox */
var mapboxToon = L.tileLayer("https://{s}.tiles.mapbox.com/v3/examples.bc17bb2a/{z}/{x}/{y}.png", {
  detectRetina: 'true',
  maxZoom: 21,
  subdomains: ["a", "b", "c", "d"],
  attribution: 'Tiles courtesy of <a href="http://www.mapbox.com/" target="_blank">Mapbox</a> '
});

// Here's the Tabletop feed
// First we'll initialize Tabletop with our spreadsheet
var jqueryNoConflict = jQuery;
jqueryNoConflict(document).ready(function(){
  initializeTabletopObject('1ynu8iX51VeVtK-ppjhJMmRq5of5eWveLQrw4cPiLfVY');
});

// Pull data from Google spreadsheet
// And push to our startUpLeaflet function
function initializeTabletopObject(dataSpreadsheet){
  Tabletop.init({
      key: dataSpreadsheet,
      callback: startUpLeafet,
      simpleSheet: true,
      debug: false
    });
}

/* Overlay Layers */
var highlight = L.geoJson(null);

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

function startUpLeafet(tabletopData) {
  // Tabletop creates arrays out of our data
  // We'll loop through them and create markers for each
  for (var num = 0; num < tabletopData.length; num ++) {
    // Our table columns
    // Change 'brewery', 'address', etc.
    // To match table column names in your table
    var dataOne = tabletopData[num].name;

    // Pull in our lat, long information
    var dataLat = tabletopData[num].lat;
    var dataLon = tabletopData[num].lon;

    // Add to our marker
    marker_location = new L.LatLng(dataLat, dataLon);
    // Create the marker
      layer = new L.Marker(marker_location);
    
      // Create the popup
      // Change 'Address', 'City', etc.
    // To match table column names in your table
      var popup = "<div class=popup_box" + "id=" + num + ">";
      popup += "<div class='popup_box_header'><strong>" + dataOne + "</strong></div>";
      popup += "</div>";
      // Add to our marker
    layer.bindPopup(popup);
  
    // Add marker to our to map
    map.addLayer(layer);
  }
};

/* Empty layer placeholder to add to layer control for listening when to add/remove pois to markerClusters layer
var poiLayer = L.geoJson(null);
var pois = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.AwesomeMarkers.icon({
        icon: 'fire-extinguisher',
        markerColor: 'orange',
        prefix: 'fa',
        spin:false
    }),
      title: feature.properties.Place,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.Place + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.Address + "</td></tr>" + "<tr><th>Phone</th><td>" + feature.properties.Phone + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<tr><th>Hours</th><td>" + feature.properties.Hours + "</td></tr>" + "<tr><th>Cost</th><td>" + feature.properties.Cost + "</td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html("<i class='fa fa-fire-extinguisher fa-border' style='color: orange'></i>&nbsp;" + feature.properties.Place);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            stroke: false,
            fillColor: "#00FFFF",
            fillOpacity: 0.7,
            radius: 10
          }));
        }
      });
      $("#feature-list tbody").append('<tr style="cursor: pointer;"><td style="vertical-align: middle;"><i class="fa fa-fire-extinguisher" style="color: orange"></i>&nbsp;</td><td class="feature-name" id="'+L.stamp(layer)+'">'+layer.feature.properties.Place+'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      poiSearch.push({
        name: layer.feature.properties.Place,
        address: layer.feature.properties.Address,
        source: "Places",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/CO2.geojson", function (data) {
  pois.addData(data);
  map.addLayer(poiLayer);
}); */

map = L.map("map", {
  zoom: 10,
  center: [42.404703, -71.154661],
  layers: [mapboxToon, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === poiLayer) {
    markerClusters.addLayer(pois);
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === poiLayer) {
    markerClusters.removeLayer(pois);
  }
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://davidtodd.info'>davidtodd.info</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-direction",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

var isCollapsed = true;

var baseLayers = {
  "Basemap": mapboxToon
};

var groupedOverlays = {
  "Points of Interest": {
    "<i class='fa fa-fire-extinguisher' style='color: orange'></i>&nbsp;CO2 Refills": poiLayer
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  /* Fit map to trail bounds */
  map.fitBounds(pois.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var poiBH = new Bloodhound({
    name: "Places",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: poiSearch,
    limit: 10
  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=dmofot&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  poiBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Places",
    displayKey: "name",
    source: poiBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><i class='fa fa-fire-extinguisher' style='color: orange'></i>&nbsp;Places</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Places") {
      if (!map.hasLayer(poiLayer)) {
        map.addLayer(poiLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});
