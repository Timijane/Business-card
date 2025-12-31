const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", socket => {

  socket.on("join-room", room => {
    socket.join(room);
    socket.to(room).emit("incoming-call");
  });

  socket.on("call-accepted", room => {
    socket.to(room).emit("call-accepted");
  });

  socket.on("call-rejected", room => {
    socket.to(room).emit("call-rejected");
  });

  socket.on("offer", data => {
    socket.to(data.room).emit("offer", data.offer);
  });

  socket.on("answer", data => {
    socket.to(data.room).emit("answer", data.answer);
  });

  socket.on("ice", data => {
    socket.to(data.room).emit("ice", data.candidate);
  });

  socket.on("chat-message", data => {
    socket.to(data.room).emit("chat-message", data.message);
  });

  socket.on("end-call", room => {
    socket.to(room).emit("end-call");
  });

});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
