const express = require("express");
const app = express();
// const { v4: uuidV4 } = require('uuid')

let broadcaster;
let rooms = {}
let connectedByRooms = {}
const port = process.env.PORT || 4000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));


app.get('/broadcast/:room', function(req, res){
  res.sendFile(__dirname + '/public/broadcast.html');
});

app.get('/watch/:room', function(req, res){
  res.sendFile(__dirname + '/public/watch.html');
});



io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {

  function getRoomsByUser(id){
    let usersRooms = [];
    let rooms = io.sockets.adapter.rooms;
    for(let room in rooms){
        if(rooms.hasOwnProperty(room)){
            let sockets = rooms[room].sockets;
            if(id in sockets && id != room)
                usersRooms.push(room);          
        }
    }
    return usersRooms;
  }

  function getUsersFromRoom(room){
    let roomUsers = [];
    let users = socket.adapter.rooms[room];
    for(let user in users['sockets'])
        roomUsers.push(user);
    return roomUsers;
  }

  socket.on('create', function (room) {
    socket.join(room);
    connected = getUsersFromRoom(room)
    io.in(room).emit("list_room_users", connected);
     
  });

  socket.on("broadcaster", (room) => {
    console.log('socket.on("broadcaster")')
    console.log(room)
    // broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });

  socket.on("watcher", (room) => {
    console.log('socket.on("watcher"')
    console.log(room)
    socket.to(room).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    console.log(' socket.on("offer"')
    socket.broadcast.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    console.log('socket.on("answer"')
    socket.broadcast.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    console.log('socket.on("candidate"')
    socket.broadcast.to(id).emit("candidate", socket.id, message);
  });

  
  socket.on("disconnect", () => {
    console.log('socket.on("disconnect"')
    io.emit('remove-user', socket.id);
  });
  
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
