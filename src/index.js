const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server); //it also sets up a file to be served up that your client can access
//socket io takes raw http server thats why we created it explicitely

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");
//to use the static files like html,cs and js we have to tell the express that we are using this file and also provide the route of the path
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("new websocket connection");
  //we have to load the client side of the socket.io
  //the goal is to make a counter app that will send the updated count to all the user
  //right now the .on function is not have any arguements we pass socket...socket is a object -- it contains information about the new connection
  //so we use methods on socket to communicate with that client
  //   to send the event from the server we use socket.emit("name_of_the_event")
  // count: this can be accessed by the callback in the client side

  //   socket.emit("countUpdated", count);
  //   //listening the even and upgrading count +1 and then passing this updated count to the client side
  //   socket.on("increment", () => {
  //     count++;
  //     // socket.emit("countUpdated", count); //this one emits the event for the specific client
  //     io.emit("countUpdated", count); //this one emits the event for all the client(for every single connection)
  //   });

  //this will emit the event for all the user except that current user..(like if we want to tell that there is a new user entered the chat we can use this object and send all the user that the current user has entered the chat)
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "welcome!"));

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("profanity is not allowed!");
    }
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  //tell about if the user leaves the chat
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "sendLocation",
      generateMessage(
        user.username,
        `https://google.com/maps?q=${location.lat},${location.long}`
      )
    );
    callback();
  });
});

server.listen(port, () => {
  console.log("Server is up on port 3000");
});
