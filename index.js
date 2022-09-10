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

    targets.forEach(target => {
      const opacity = target.active ? 0.5 : 0.1;
      var marker = L.circle([target.lat, target.lon], {color: target.group.color, fillOpacity: opacity});
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

targets = db.targets;
groups = {
    'A': {color: 'hotpink', animal: 3},
    'B': {color: 'springgreen', animal: 1},
    'C': {color: 'darkorange', animal: 4}
}
items = [
    {animal: 4, part: 'head', target: '43'},
    {animal: 4, part: 'body', target: '44'},
    {animal: 4, part: 'hands', target: '45'},
    {animal: 4, part: 'feet', target: '46'},
    {animal: 1, part: 'head', target: '47'},
    {animal: 1, part: 'body', target: '48'},
    {animal: 1, part: 'hands', target: '49'},
    {animal: 1, part: 'feet', target: '50'},
    {animal: 3, part: 'head', target: '51'},
    {animal: 3, part: 'body', target: '52'},
    {animal: 3, part: 'hands', target: '53'},
    {animal: 3, part: 'feet', target: '54'}
]

targets.forEach(target => {
  item = items.find(i => i.target == target.code);
  target.item = item;
  target.group = groups[target.group];
  target.active = (avatar[item.part] == item.animal);
});

mapDisplay.init(db.perimeter, targets);

