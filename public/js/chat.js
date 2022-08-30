const socket = io();

//the name should be same as called on the server side emit event....
// socket.on("countUpdated", (count) => {
//   console.log("the count has been updated! ", count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("clicked!!");
//   //we want to emit this event and listen it on server
//   socket.emit("increment"); //we are only emitting this event to listen on server ... when we listen on server we increment the count and emit the event with updated data
// });

//elements
const $messageForm = document.querySelector("#mes-form");
const $messageInput = document.querySelector("#mes-input");
const $messageButton = document.querySelector("#form-submit");
const $sendLocationBtn = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//auto scrolling when the messages increases
const autoscroll = () => {
  //get the new message element
  const $newMessage = $messages.lastElementChild; //last element would be the latest message

  //get the height of the new message --- actual height including the top and bottom margin if any*
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin; //this doesn't include the margin ...SO what we do is extract the styles from that element and add it to the height of the element where we are storing it ---^(see above)

  //get the visible height -- visible height is constant it does not change --- height of the container which is above the message input and button
  const visibleHeight = $messages.offsetHeight;

  //total height - get height of messages container(included the messages height which we are not able to see)
  const containerHeight = $messages.scrollHeight; //we are using the scrollHeight so that got the scrolled height also that we needed exactly we needed

  //how far have i scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight; //it means how far i have scrolled -- means from the top including the visible height how far i have scrolled
  const height = containerHeight - newMessageHeight;
  if (height <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
  $messages.scrollTop = $messages.scrollHeight;
};

socket.on("message", (mes) => {
  console.log(mes);
  const html = Mustache.render(messageTemplate, {
    username: mes.username,
    mes: mes.text,
    createdAt: moment(mes.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("sendLocation", (url) => {
  console.log(url);
  const html = Mustache.render(locationTemplate, {
    username: url.username,
    url: url.text,
    createdAt: moment(url.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

//template for sidebar
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageButton.setAttribute("disabled", "disabled");
  socket.emit("sendMessage", $messageInput.value, (error) => {
    $messageButton.removeAttribute("disabled");
    $messageInput.value = "";
    $messageInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message Delivered!");
  });
});

socket.on("sendMessage", (message) => {
  console.log(message);
});

$sendLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported in your browser!!!");
  }
  $sendLocationBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      () => {
        $sendLocationBtn.removeAttribute("disabled");
        console.log("location shared!");
      }
    );
  });

  // socket.emit("sendLocation", location);
  // socket.on("sendLocation", (location) => {
  //   console.log(`Latitude : ${location.latitude} ${location.longitude}`);
  // });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
