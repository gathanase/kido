avatar = {
  head: 1,
  hands: 4,
  body: 3,
  feet: 1
}

function drawAvatar() {
  var canvas = document.getElementById("canvas");
  var ratio = window.devicePixelRatio;
  canvas.width = 500 * ratio;
  canvas.height = 507 * ratio;
  assets = 'assets/images/cute';

  var context = canvas.getContext("2d");
  context.scale(ratio, ratio);

  var head = new Image();
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

drawAvatar();


var map = L.map('map', {
    //scrollWheelZoom: false,
    //doubleClickZoom: false,
    //touchZoom: false,
    //boxZoom: false,
    //tap: false,
    //keyboard: false,
    zoomControl: false,
    //dragging: false,
    maxBoundsViscosity: 0.5
});
var perimeter = L.polygon(db['perimeter'], {color: 'black', fill: false}).addTo(map);
var bounds = perimeter.getBounds();
map.fitBounds(bounds);
map.setMaxBounds(bounds);
map.setMinZoom(map.getZoom());

L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo(map);

targets = db['targets'];
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
var popup = L.popup();

targets.forEach(target => {
    item = items.find(i => i.target == target.code);
    const opacity = (avatar[item.part] == item.animal) ? 0.5 : 0.1;
    function onMarkerClick(e) {
        item = items.find(i => i.target == target.code);
        console.log(item);
        avatar[item.part] = item.animal;
        drawAvatar();
        //popup
        //    .setLatLng(L.latLng(target.lat, target.lon))
        //    .setContent(target.code)
        //    .openOn(map);
    }
    var marker = L.circle([target.lat, target.lon], {color: groups[target.group].color, fillOpacity: opacity});
    marker.on('click', onMarkerClick);
    marker.addTo(map);
});
