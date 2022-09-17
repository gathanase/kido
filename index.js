const trophies = new Set(); // set of animalId

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
      if (avatar[partId] === 0) {
        continue;
      }
      for (let rect of rectangles) {
        const img = new Image();
        img.onload = function (e) {
          [x, y, w, h] = [rect.x0, rect.y0, rect.x1-rect.x0, rect.y1-rect.y0];
          context.drawImage(img, x, y, w, h, x, y, w, h);
        }
        img.src = `${assets}/${avatar[partId]}.jpg`;
      }
    }
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
  map: L.map('my-map', {zoomControl: false}),
  init: function(perimeter, items) {
    var map = this.map;
    var polygon = L.polygon(perimeter, {color: 'black', fill: false})
    var bounds = polygon.getBounds();
    polygon.addTo(map);
    map.fitBounds(bounds);
    map.setMaxBounds(bounds);
    map.setMinZoom(map.getZoom());
    
    L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        subdomains:['mt0','mt1','mt2','mt3']
    }).addTo(map);

    items.forEach(item => {
      const active = avatar[item.part] == item.animal;
      const opacity = active ? 0.6 : 0.1;
      const color = animals[item.animal].color;
      if (active) {
        item.known = true;
      }
      var marker = L.circle([item.cp.lat, item.cp.lon], {color: color, fillOpacity: opacity});
      item.marker = marker;

      function onMarkerClick(e) {
          set_part(item.part, item.animal);
          //const partName = item.known ? parts[item.part].name : '?';
          //const animalName = animals[item.animal].name;
          //cpModal.item = item;
          //cpModal.setTitle(`${partName} de ${animalName}`);
          //cpModal.show();
      }
      marker.on('click', onMarkerClick);
      marker.addTo(map);
    });
  },

  update: function() {
    items.forEach(item => {
      const active = avatar[item.part] == item.animal;
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
const geo = geos.find(i => i.name == "maps/26_pignedore.kml");
geo.control_points.sort((a, b) => a.group.localeCompare(b.group));
var items = [];
var cp_idx = 0;
for (let animal of [1, 3, 4]) {
  for (let part of ['head', 'body', 'hands', 'feet']) {
    var item = {'animal': animal, 'part': part, 'cp': geo.control_points[cp_idx], 'known': false}
    items.push(item);
    cp_idx++;
  }
}

mapDisplay.init(geo.perimeter, items);

function set_part(part, animal) {
  avatar[part] = animal;
  mapDisplay.update();
  avatarDisplay.paint(avatar);

  new bootstrap.Tab(document.querySelector('#nav-avatar-tab')).show();
  const allEqual = arr => arr.every( v => v === arr[0] )
  if (animal != 0 && !trophies.has(animal) && allEqual([avatar.head, avatar.hands, avatar.body, avatar.feet])) {
    trophies.add(animal);
    var img = document.createElement("img");
    img.setAttribute("src", `assets/images/${settings.theme}/${animal}.jpg`);
    document.getElementById("trophies").appendChild(img);

    new Audio(`assets/mp3/${animals[animal].audio}`).play();
  }
}

function submit_cp(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const formProps = Object.fromEntries(formData);
  item = cpModal.item;
  if (formProps.code == item.cp.code) {
    cpModal.inputDom.classList.remove('is-invalid');
    cpModal.hide();
    set_part(item.part, item.animal);
  } else {
    cpModal.inputDom.classList.add('is-invalid');
  }
  return false;
}
