const animals = {
  1: {code: 1, name: 'grenouille', color: 'springgreen'},
  2: {code: 2, name: 'vache', color: 'saddlebrown'},
  3: {code: 3, name: 'cochon', color: 'hotpink'},
  4: {code: 4, name: 'renard', color: 'darkorange'},
  5: {code: 5, name: 'lapin', color: 'gainsboro'},
  6: {code: 6, name: 'hibou', color: 'gray'}
}

const parts = {
  head: 'tête',
  hands: 'mains',
  body: 'corps',
  feet: 'pieds'
}

var avatar = {
  head: 1,
  hands: 3,
  body: 1,
  feet: 4,
  theme: 'cute'
}

var avatarDisplay = {
  canvas: document.getElementById("canvas"),
  context: null,
  init: function() {
    var ratio = window.devicePixelRatio;
    this.canvas.width = 500 * ratio;
    this.canvas.height = 507 * ratio;
    this.context = this.canvas.getContext("2d");
    this.context.scale(ratio, ratio);
  },

  paint: function(avatar) {
    var assets = `assets/images/${avatar.theme}`;
    var head = new Image();
    var context = this.context
    head.onload = function (e) { context.drawImage(head, 0, 0, 500, 231); }
    head.src = `${assets}/th${avatar.head}.jpg`;
  
    var leftHand = new Image();
    leftHand.onload = function (e) { context.drawImage(leftHand, 0, 231, 164, 77); }
    leftHand.src = `${assets}/bd${avatar.hands}.jpg`;
  
    var torso = new Image();
    torso.onload = function (e) { context.drawImage(torso, 164, 231, 174, 77); }
    torso.src = `${assets}/tb${avatar.head}.jpg`;
  
    var rightHand = new Image();
    rightHand.onload = function (e) { context.drawImage(rightHand, 164+174, 231, 162, 77); }
    rightHand.src = `${assets}/bg${avatar.hands}.jpg`;
  
    var body = new Image();
    body.onload = function (e) { context.drawImage(body, 0, 231+77, 500, 113); }
    body.src = `${assets}/c${avatar.body}.jpg`;
  
    var feet = new Image();
    feet.onload = function (e) { context.drawImage(feet, 0, 231+77+113, 500, 86); }
    feet.src = `${assets}/p${avatar.feet}.jpg`;
  }
}

avatarDisplay.init();
avatarDisplay.paint(avatar);


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
          avatar[item.part] = item.animal;
          avatarDisplay.paint(avatar);
      //    this.update();
      //    //new bootstrap.Tab(document.querySelector('#nav-avatar-tab')).show();
      }
      const partName = item.known ? parts[item.part] : '?';
      marker.bindPopup(`${partName} de ${animals[item.animal].name}`);
      marker.addTo(map);
    });
  }

  //update: function(targets) {
  //  Object.values(targets).forEach(target => {
  //    const active = avatar[target.part] == target.animal;
  //    target.marker.remove();
  //    target.marker.options.fillOpacity = active ? 0.6 : 0.1;
  //    target.marker.addTo(map);
  //  });
  //}
}


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

