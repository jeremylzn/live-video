let peerConnection;
const config = {
  iceServers: [
      
        { urls: 'stun:stun.l.google.com:19302'},
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      
      // { 
      //   "urls": "turn:TURN_IP?transport=tcp",
      //   "username": "TURN_USERNAME",
      //   "credential": "TURN_CREDENTIALS"
      // }
  ]
};

const socket = io.connect();


var url = window.location.pathname;
var room = url.substring(url.lastIndexOf('/') + 1);

socket.emit('create', room);

(() => {
  document.getElementById("roomId").innerHTML = room;
  })();


socket.on('list_room_users', (data) => {
  document.getElementById('users').innerHTML = "";
  for (var i = 0; i < data.length; i++) {
    var el = document.createElement('div'), users = data[i]
    el.setAttribute('id', users);
    el.innerHTML = users;
    // el.addEventListener('click', function () {
    //     createOffer(id);
    // });
    document.getElementById('users').appendChild(el);
  }
});

const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");

enableAudioButton.addEventListener("click", enableAudio)

socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});


socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  socket.emit("watcher", room);
});

socket.on("broadcaster", () => {
  socket.emit("watcher", room);
});

socket.on('remove-user', function (id) {
  var div = document.getElementById(id);
  if (div)
    document.getElementById('users').removeChild(div);
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};

function enableAudio() {
  console.log("Enabling audio")
  video.muted = false;
}