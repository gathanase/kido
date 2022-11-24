var settings = {
  theme: 'cute'
}

var circuitModal = {
  dom: document.querySelector('#circuitModal'),
  bs: new bootstrap.Modal(document.querySelector('#circuitModal')),
  circuit: null,
  show: function() {
    this.bs.show();
  },
  hide: function() {
    this.bs.hide()
  },
  setTitle: function(text) { this.dom.querySelector('.modal-title').textContent = text },
  setDesc: function(text) { this.dom.querySelector('.modal-body').textContent = text }
}

var mapDisplay = {
  map: L.map('map', {zoomControl: false}),
  sidebar: L.control.sidebar('sidebar'),
  init: function(circuits) {
    var map = this.map;
    var polygon = L.polygon(circuits.flatMap(circuit => circuit.perimeter));
    var bounds = polygon.getBounds();
    map.fitBounds(bounds);

    L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        subdomains:['mt0','mt1','mt2','mt3']
    }).addTo(map);
    this.sidebar.addTo(map);

    circuits.forEach(circuit => {
      var cp = circuit.control_points[0];
      var marker = L.marker([cp.lat, cp.lon]);
      circuit.marker = marker;

      function onMarkerClick(e) {
          circuitModal.circuit = circuit;
          circuitModal.setTitle(circuit.name);
          circuitModal.setDesc(circuit.description);
          circuitModal.show();
      }
      marker.on('click', onMarkerClick);
      marker.addTo(map);
    });
  }
}

mapDisplay.init(circuits);

//function set_part(partId, animalId) {
//  avatar[partId] = animalId;
//  mapDisplay.update();
//  mapDisplay.sidebar.open("avatar");
//  avatarDisplay.animate(partId, animalId);
//
//  const allEqual = arr => arr.every( v => v === arr[0] )
//  if (animalId != 0 && !completed.has(animalId) && allEqual([avatar.head, avatar.hands, avatar.body, avatar.feet])) {
//    completed.add(animalId);
//    var audioFile = `assets/mp3/${animals[animalId].audio}`;
//    var img = document.createElement("img");
//    img.setAttribute("src", `assets/images/${settings.theme}/${animalId}.jpg`);
//    img.setAttribute("onclick", `new Audio('${audioFile}').play()`);
//    document.getElementById("completed").appendChild(img);
//
//    new Audio(audioFile).play();
//  }
//}
//
//// coordinates are in degrees, returns the distance in meters
//function distance(lat1, lon1, lat2, lon2) {
//  var R = 6371000;
//  var lat1 = toRad(lat1);
//  var lat2 = toRad(lat2);
//  var dLat = toRad(lat2-lat1);
//  var dLon = toRad(lon2-lon1);
//
//  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
//  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//  var d = R * c;
//  return d;
//}
//
//// Converts numeric degrees to radians
//function toRad(degrees)
//{
//  return degrees * Math.PI / 180;
//}

function submit_circuit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const formProps = Object.fromEntries(formData);
  circuit = circuitModal.circuit;

  circuitModal.hide();
  window.location.href = `course.html?circuit=${circuit.name}`;
  return false;
}
