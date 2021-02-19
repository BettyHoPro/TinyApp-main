const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const { generateRandomString, checkIfEmailExist, getUserByEmail, checkIfPassWordsAreIdentical, urlsForUser, ifUrlBelongReviewer } = require('./helpers');

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


// === post === //
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  if (! req.session.user_id) {
    res.status(401).send("401 ERROR, Unauthorized!");
  };
  urlDatabase[shortURL] = { longURL, userID: req.session.user_id };
  res.redirect(`urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const reviewer = users[req.session["user_id"]];
  const shortUrlOnIndex = urlDatabase[req.params.shortURL];
  if (!reviewer || !shortUrlOnIndex || !ifUrlBelongReviewer(shortUrlOnIndex,reviewer)) {
    return res.redirect('/urls');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const reviewer = users[req.session["user_id"]];
  const shortUrlOnIndex = urlDatabase[req.params.shortURL];
  if (!reviewer || !shortUrlOnIndex || !ifUrlBelongReviewer(shortUrlOnIndex,reviewer)) {
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
      let userID = getUserByEmail(email, users);
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
  if (req.body.email.length < 1 || req.body.password.length < 1 || checkIfEmailExist(req.body.email, users)) {
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
  if (!users[req.session["user_id"]]) {
    res.redirect("/login");
  }
  const templateVars = { urls: urlsForUser(urlDatabase, users[req.session["user_id"]].id), user: users[req.session["user_id"]]};
  res.render('urls_index', templateVars);
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
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.status(404).send("404 ERROR, Page Not Found");
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session["user_id"]]};
  res.render('urls_show', templateVars);
});

app.get('/urls/:shortURL/delete', (req, res) => {
  res.redirect('/urls');
});


app.get('/u/:shortURL', (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.status(404).send("404 ERROR, Page Not Found");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  if (users[req.session["user_id"]]) {
    res.redirect("/urls");
  }
  const templateVars = { user: users[req.session["user_id"]]};
  res.render('register', templateVars);
});

// const shortURL = req.params.shortURL;
// shortURL.longURL = urlDatabase[req.params.shortURL];
// shortURL.user = users[req.cookies["user_id"]];
// const templateVars = { shortURL };

app.get('/login', (req, res) => {
  if (users[req.session["user_id"]]) {
    res.redirect("/urls");
  }
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