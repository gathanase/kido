const animals = {
  1: {code: 1, name: 'grenouille', color: 'springgreen'},
  2: {code: 2, name: 'vache', color: 'saddlebrown'},
  3: {code: 3, name: 'cochon', color: 'hotpink'},
  4: {code: 4, name: 'renard', color: 'darkorange'},
  5: {code: 5, name: 'lapin', color: 'gainsboro'},
  6: {code: 6, name: 'hibou', color: 'gray'}
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
  init: function(perimeter, targets) {
    var polygon = L.polygon(perimeter, {color: 'black', fill: false})
    var bounds = polygon.getBounds();
    polygon.addTo(this.map);
    this.map.fitBounds(bounds);
    this.map.setMaxBounds(bounds);
    this.map.setMinZoom(this.map.getZoom());
    
    L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        subdomains:['mt0','mt1','mt2','mt3']
    }).addTo(this.map);

    Object.values(targets).forEach(target => {
      const active = avatar[target.part] == target.animal;
      const opacity = active ? 0.6 : 0.1;
      const color = animals[target.animal].color;
      var marker = L.circle([target.lat, target.lon], {color: color, fillOpacity: opacity});
      function onMarkerClick(e) {
          console.log(target.item);
          //avatar[item.part] = item.animal;
          //drawAvatar();
      }
      marker.on('click', onMarkerClick);
      marker.addTo(this.map);
    });
  }
}


const geo = geos.find(i => i.name == "26_pignedore.kml");
Object.assign(geo.targets['43'], {animal: 4, part: 'head'});
Object.assign(geo.targets['44'], {animal: 4, part: 'body'});
Object.assign(geo.targets['45'], {animal: 4, part: 'hands'});
Object.assign(geo.targets['46'], {animal: 4, part: 'feet'});

Object.assign(geo.targets['47'], {animal: 1, part: 'body'});
Object.assign(geo.targets['48'], {animal: 1, part: 'head'});
Object.assign(geo.targets['49'], {animal: 1, part: 'feet'});
Object.assign(geo.targets['50'], {animal: 1, part: 'hands'});

Object.assign(geo.targets['51'], {animal: 3, part: 'feet'});
Object.assign(geo.targets['52'], {animal: 3, part: 'hands'});
Object.assign(geo.targets['53'], {animal: 3, part: 'head'});
Object.assign(geo.targets['54'], {animal: 3, part: 'body'});

mapDisplay.init(geo.perimeter, geo.targets);

