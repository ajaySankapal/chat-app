const users = [];

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
  //Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  //   check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validate user
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    //splice remove the element at the particular index,,, so as the first arguement we share the index and as the second arguement we share the number of elements we want to remove in this case 1
    return users.splice(index, 1)[0];
  }
};

//getUser
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

//getUsersInRoom
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
