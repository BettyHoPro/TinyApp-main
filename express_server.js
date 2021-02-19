const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const { generateRandomString, checkIfEmailExist, checkIfPassWordsAreIdentical, urlsForUser, ifUrlBelongReviewer } = require('./helpers');

// const password = "purple-monkey-dinosaur"; // found in the req.params object
//const hashedPassword = bcrypt.hashSync(password, 10);

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['think app crush any second', 'tiny app heaven']
}));
app.set('view engine', 'ejs');
app.use(express.static('public'));
// === database === //

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "sdfc1w" },
  adfrvs: { longURL: "https://www.amazon.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur",10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk",10)
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "test@gmail.com",
    password: bcrypt.hashSync("1234567",10)
  },
  "sdfc1w": {
    id: "sdfc1w",
    email: "test2@gmail.com",
    password: bcrypt.hashSync("1234567",10)
  }
};

// // === reusable functions === //
// const generateRandomString = () => {
//   return Math.random().toString(36).substr(2,6);
// };


// const checkIfEmailExist = (email) => {
//   return Object.keys(users).map(x => users[x].email).includes(email);
// };

// const checkIfPassWordsAreIdentical = (password) => {
//   // bcrypt.compareSync(password, hashedPassword)
//   //                    initial   hased already in this case got from stored users obj database
//   return Object.keys(users).some(x => bcrypt.compareSync(password,users[x].password));
// };


// // const urlsForUser = (userID) => {
// //   // no idea why index of userID find is 0, or -1 for unfind.
// //   //let userOwnUrls = {};
// //   return Object.keys(urlDatabase).filter(x => !urlDatabase[x].userID.indexOf(userID) && urlDatabase[x]);
// // };

// const urlsForUser = (database, userID) => {
//   let idOwnURL = {};
//   for (const shortURL in database) {
//     if (database[shortURL].userID === userID) {
//       idOwnURL[shortURL] = database[shortURL];
//       // different userURLs[url] = { longURL: database[url].longURL, userID };
//     }
//   }
//   return idOwnURL;
// };

// const ifUrlBelongReviewer = (url, user) => {
//   if (url["userID"] === user['id']) {
//     return true;
//   }
//   return false;
// };

// === post === //
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: req.session.user_id };
  res.redirect(`urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const reviewer = users[req.session["user_id"]];
  const shortUrlOnIndex = urlDatabase[req.params.shortURL];
  if (!reviewer || !shortUrlOnIndex || !ifUrlBelongReviewer(shortUrlOnIndex,reviewer)) {
    console.log("Not permit");
    return res.redirect('/urls');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const reviewer = users[req.session["user_id"]];
  const shortUrlOnIndex = urlDatabase[req.params.shortURL];
  if (!reviewer || !shortUrlOnIndex || !ifUrlBelongReviewer(shortUrlOnIndex,reviewer)) {
    console.log("Not permit");
    return res.redirect('/urls');
  }
 
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (checkIfEmailExist(email, users)) {
    if (checkIfPassWordsAreIdentical(password, users)) {
      let userID = Object.keys(users)[Object.keys(users).map(x => users[x].email).indexOf(email)];
      req.session.user_id = userID;
      res.redirect('/urls');
    }
    res.sendStatus(403);
  }
  res.sendStatus(403);
});

app.post('/logout', (req, res) => {
  req.session = null;
  //res.clearCookie("user_id");
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if (req.body.email.length < 1 || req.body.password.length < 1 || checkIfEmailExist(req.body.email, urlDatabase)) {
    res.sendStatus(400);
  }
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const userID = generateRandomString(6);
  users[userID] = {id: userID, email: req.body.email, password: hashedPassword };
  console.log(users);
  req.session.user_id = userID;
  res.redirect('/urls');
});

// ==== get ==== //
app.get('/', (req, res) => {
  res.send('Hello!');
});
// app.get("/hello", (req, res) => {
//   const templateVars = { greeting: 'Hello World!' };
//   res.render("hello_world", templateVars);
// });

app.get('/urls', (req, res) => {
  if (!users[req.session["user_id"]]) {
    res.redirect("/login");
  }
  const templateVars = { urls: urlsForUser(urlDatabase, users[req.session["user_id"]].id), user: users[req.session["user_id"]]};
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!users[req.session["user_id"]]) {
    res.redirect("/login");
  }
  const templateVars = { user: users[req.session["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session["user_id"]]};
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.sendStatus(404);
  }
  res.render('urls_show', templateVars);
});

app.get('/urls/:shortURL/delete', (req, res) => {
  res.redirect('/urls');
});


app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.render('urls_error');
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
 
  const templateVars = { user: users[req.session["user_id"]]};
  res.render('register', templateVars);
});

// const shortURL = req.params.shortURL;
// shortURL.longURL = urlDatabase[req.params.shortURL];
// shortURL.user = users[req.cookies["user_id"]];
// const templateVars = { shortURL };

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session["user_id"]]};
  res.render('login', templateVars);
});

app.get('/urls.json',  (req, res) => {
  res.json(urlDatabase);
});

// === event listener in the end === //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});