// === reusable functions === //
const generateRandomString = () => {
  return Math.random().toString(36).substr(2,6);
};


const checkIfEmailExist = (email) => {
  return Object.keys(users).map(x => users[x].email).includes(email);
};

const checkIfPassWordsAreIdentical = (password) => {
  // bcrypt.compareSync(password, hashedPassword)
  //                    initial   hased already in this case got from stored users obj database
  return Object.keys(users).some(x => bcrypt.compareSync(password,users[x].password));
};


// const urlsForUser = (userID) => {
//   // no idea why index of userID find is 0, or -1 for unfind.
//   //let userOwnUrls = {};
//   return Object.keys(urlDatabase).filter(x => !urlDatabase[x].userID.indexOf(userID) && urlDatabase[x]);
// };

const urlsForUser = (database, userID) => {
  let idOwnURL = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === userID) {
      idOwnURL[shortURL] = database[shortURL];
      // different userURLs[url] = { longURL: database[url].longURL, userID };
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

module.exports = { generateRandomString, checkIfEmailExist, checkIfPassWordsAreIdentical, urlsForUser, ifUrlBelongReviewer };