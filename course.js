const urlParams = new URLSearchParams(window.location.search);

const completed = new Set(); // set of animalId

const animals = {
  1: {code: 1, name: 'grenouille', color: 'springgreen', audio: 'gregreu.mp3'},
  2: {code: 2, name: 'vache', color: 'saddlebrown', audio: 'lactosine.mp3'},
  3: {code: 3, name: 'cochon', color: 'hotpink', audio: 'cochonou.mp3'},
  4: {code: 4, name: 'renard', color: 'darkorange', audio: 'fino.mp3'},
  5: {code: 5, name: 'lapin', color: 'gainsboro', audio: 'lapin.mp3'},
  6: {code: 6, name: 'hibou', color: 'gray', audio: 'zibou.mp3'}
}

const parts = {
  head: {name: 'tête'},
  hands: {name: 'mains'},
  body: {name: 'corps'},
  feet: {name: 'pieds'}
}

var avatar = {
  head: 0,
  hands: 0,
  body: 0,
  feet: 0
}

var settings = {
  theme: 'cute'
}

var avatarDisplay = {
  canvas: document.getElementById("canvas"),
  context: null,
  mosaic: {
    head: [
      {x0: 0, y0: 0, x1: 930, y1: 428},
      {x0: 304, y0: 428, x1: 628, y1: 571}
    ],
    hands: [
      {x0: 0, y0: 428, x1: 304, y1: 571},
      {x0: 628, y0: 428, x1: 930, y1: 571}
    ],
    body: [
      {x0: 0, y0: 571, x1: 930, y1: 781}
    ],
    feet: [
      {x0: 0, y0: 781, x1: 930, y1: 940}
    ]
  },
  init: function() {
    var ratio = window.devicePixelRatio;
    this.canvas.width = 931 * ratio;
    this.canvas.height = 941 * ratio;
    this.context = this.canvas.getContext("2d");
    this.context.scale(ratio, ratio);
  },

  paint: function(avatar) {
    var assets = `assets/images/${settings.theme}`;
    var context = this.context

    for (const [partId, rectangles] of Object.entries(this.mosaic)) {
      var animalId = avatar[partId];
      if (animalId === 0) {
        continue;
      }
      const img = new Image();
      img.onload = function (e) {
        for (let rect of rectangles) {
          [x, y, w, h] = [rect.x0, rect.y0, rect.x1-rect.x0, rect.y1-rect.y0];
          context.drawImage(img, x, y, w, h, x, y, w, h);
        }
      }
      img.src = `${assets}/${animalId}.jpg`;
    }
  },

  animate: function(partId, animalId) {
    var assets = `assets/images/${settings.theme}`;
    var context = this.context;

    var rectangles = this.mosaic[partId];
    var tiles = [];
    for (let rect of rectangles) {
      s = 20;
      for (let tx=rect.x0; tx<rect.x1; tx=tx+s) {
        tile = {x0: tx, x1: Math.min(tx+s, rect.x1), y0: rect.y0, y1: rect.y1};
        tiles.push(tile);
      }
    }
    tiles.reverse();

    const img = new Image();
    img.onload = function (e) {
      timer = setInterval(function () {
        if (tiles.length) {
          var rect = tiles.pop(0);
          [x, y, w, h] = [rect.x0, rect.y0, rect.x1-rect.x0, rect.y1-rect.y0];
          context.drawImage(img, x, y, w, h, x, y, w, h);
        } else {
          clearInterval(timer);
        }
      }, 50);
    }
    img.src = `${assets}/${avatar[partId]}.jpg`;
  }
}

avatarDisplay.init();
avatarDisplay.paint(avatar);

var cpModal = {
  dom: document.querySelector('#cpModal'),
  bs: new bootstrap.Modal(document.querySelector('#cpModal')),
  item: null,
  inputDom: document.querySelector('#cpModal').querySelector('input'),
  show: function() {
    this.inputDom.classList.remove('is-invalid');
    this.inputDom.value = '';
    this.bs.show();
  },
  hide: function() {
    this.bs.hide()
  },
  setTitle: function(text) { this.dom.querySelector('.modal-title').textContent = text }
}
cpModal.dom.addEventListener('shown.bs.modal', () => {
  cpModal.inputDom.focus()
})

var mapDisplay = {
  map: L.map('map', {zoomControl: false}),
  sidebar: L.control.sidebar('sidebar'),
  init: function(perimeter, items) {
    var map = this.map;
    var polygon = L.polygon(perimeter, {color: 'black', fill: false})
    var bounds = polygon.getBounds();
    polygon.addTo(map);
    map.fitBounds(bounds);
    map.setMaxBounds(bounds);
    map.setMinZoom(map.getZoom());

    L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        subdomains:['mt0','mt1','mt2','mt3']
    }).addTo(map);
    this.sidebar.addTo(map);

    items.forEach(item => {
      const active = avatar[item.partId] == item.animalId;
      const opacity = active ? 0.6 : 0.1;
      const color = animals[item.animalId].color;
      if (active) {
        item.known = true;
      }
      var marker = L.circle([item.cp.lat, item.cp.lon], {color: color, fillOpacity: opacity});
      item.marker = marker;

      function onMarkerClick(e) {
          //set_part(item.partId, item.animalId);
          const partName = item.known ? parts[item.partId].name : '?';
          const animalName = animals[item.animalId].name;
          cpModal.item = item;
          cpModal.setTitle(`${partName} de ${animalName}`);
          cpModal.show();
      }
      marker.on('click', onMarkerClick);
      marker.addTo(map);
    });
  },

  update: function() {
    items.forEach(item => {
      const active = avatar[item.partId] == item.animalId;
      if (active) {
        item.known = true;
      }
      item.marker.remove();
      item.marker.options.fillOpacity = active ? 0.6 : 0.1;
      item.marker.addTo(this.map);
    });
  }
}

// compute all items
const circuit = circuits.find(i => i.name == urlParams.get("circuit"));
circuit.control_points.sort((a, b) => a.group.localeCompare(b.group));
var items = [];
var cp_idx = 0;
for (let animalId = 1; animalId <= circuit.control_points.length / 4; animalId++) {
  for (let partId of ['head', 'body', 'hands', 'feet']) {
    var item = {'animalId': animalId, 'partId': partId, 'cp': circuit.control_points[cp_idx], 'known': false}
    items.push(item);
    cp_idx++;
  }
}

mapDisplay.init(circuit.perimeter, items);

function set_part(partId, animalId) {
  avatar[partId] = animalId;
  mapDisplay.update();
  mapDisplay.sidebar.open("avatar");
  avatarDisplay.animate(partId, animalId);

  const allEqual = arr => arr.every( v => v === arr[0] )
  if (animalId != 0 && !completed.has(animalId) && allEqual([avatar.head, avatar.hands, avatar.body, avatar.feet])) {
    completed.add(animalId);
    var audioFile = `assets/mp3/${animals[animalId].audio}`;
    var img = document.createElement("img");
    img.setAttribute("src", `assets/images/${settings.theme}/${animalId}.jpg`);
    img.setAttribute("onclick", `new Audio('${audioFile}').play()`);
    document.getElementById("completed").appendChild(img);

    new Audio(audioFile).play();
  }
}

// coordinates are in degrees, returns the distance in meters
function distance(lat1, lon1, lat2, lon2) {
  var R = 6371000;
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(degrees)
{
  return degrees * Math.PI / 180;
}

function submit_cp(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const formProps = Object.fromEntries(formData);
  item = cpModal.item;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => console.log(distance(item.cp.lat, item.cp.lon, pos.coords.latitude, pos.coords.longitude)), error => console.log(error));
    console.log(item.cp);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  if (formProps.code == item.cp.code) {
    cpModal.inputDom.classList.remove('is-invalid');
    cpModal.hide();
    set_part(item.partId, item.animalId);
  } else {
    cpModal.inputDom.classList.add('is-invalid');
  }
  return false;
}
