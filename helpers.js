const bcrypt = require('bcrypt');

// === reusable functions === //
const generateRandomString = () => {
  return Math.random().toString(36).substr(2,6);
};

const checkIfEmailExist = (email, database) => {
  return Object.keys(database).map(x => database[x].email).includes(email);
};

const getUserByEmail = (email, database) => {
  return Object.keys(database)[Object.keys(database).map(x => database[x].email).indexOf(email)];
};

const checkIfPassWordsAreIdentical = (password, database) => {
  return Object.keys(database).some(x => bcrypt.compareSync(password,database[x].password));
};

const urlsForUser = (database, userID) => {
  let idOwnURL = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === userID) {
      idOwnURL[shortURL] = database[shortURL];
    }
  }
  return idOwnURL;
};

const ifUrlBelongReviewer = (url, user) => {
  if (url["userID"] === user['id']) {
    return true;
  }
  return false;
};

module.exports = { generateRandomString, checkIfEmailExist, checkIfPassWordsAreIdentical, getUserByEmail, urlsForUser, ifUrlBelongReviewer };