const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('public'));
// === database === //

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "sdfc1w" },
  adfrvs: { longURL: "https://www.amazon.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "test@gmail.com",
    password: "1234567"
  },
  "sdfc1w": {
    id: "sdfc1w",
    email: "test2@gmail.com",
    password: "1234567"
  }
};

// === reusable functions === //
const generateRandomString = () => {
  return Math.random().toString(36).substr(2,6);
};


const checkIfEmailExist = (email) => {
  return Object.keys(users).map(x => users[x].email).includes(email);
};

const checkIfPassWordsAreIdentical = (password) => {
  return Object.keys(users).some(x => users[x].password === password);
};


// const urlsForUser = (userID) => {
//   // no idea why index of userID find is 0, or -1 for unfind.
//   //let userOwnUrls = {};
//   return Object.keys(urlDatabase).filter(x => !urlDatabase[x].userID.indexOf(userID) && urlDatabase[x]);
// };

const urlsForUser = function(database, userID) {
  let idOwnURL = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === userID) {
      idOwnURL[shortURL] = database[shortURL];
      // different userURLs[url] = { longURL: database[url].longURL, userID };
    }
  }
  return idOwnURL;
};

// === post === //
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: req.cookies.user_id };
  res.redirect(`urls/${shortURL}`);
  
  // const shortURL = generateRandomString();
  // urlDatabase[shortURL] = {longURL : req.body.longURL, userID: req.cookies['user_id']};
  // res.redirect(/urls/${shortURL})
  //=====console.log(urlDatabase);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  //const templateVars = { shortURL: req.params.shortURL, longURL: req.body.longURL };
 
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (checkIfEmailExist(email)) {
    if (checkIfPassWordsAreIdentical(password)) {
      let userID = Object.keys(users)[Object.keys(users).map(x => users[x].email).indexOf(email)];
      res.cookie("user_id", userID);
      res.redirect('/urls');
    }
    res.sendStatus(403);
  }
  res.sendStatus(403);
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if (req.body.email.length < 1 || req.body.password.length < 1 || checkIfEmailExist(req.body.email)) {
    res.sendStatus(400);
  }
  const userID = `user${generateRandomString(6)}RandomID`;
  users[userID] = {id: userID, email: req.body.email, password: req.body.password };
  //===console.log(users);
  res.cookie("user_id", userID);
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
  if (!users[req.cookies["user_id"]]) {
    res.redirect("/login");
  }
  const templateVars = { urls: urlsForUser(urlDatabase, users[req.cookies["user_id"]].id), user: users[req.cookies["user_id"]]};
  res.render('urls_index', templateVars);
  //===console.log(urlsForUser(urlDatabase,users[req.cookies["user_id"]]));
  //==console.log(templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    res.redirect("/login");
  }
  // const shortURL = req.params.shortURL;
  // const longURL = urlDatabase[req.params.shortURL];
  // const userID = users[req.cookies["user_id"]];
  // const templateVars = { shortURL: { id: shortURL, longURL, userID}};
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  // const shortURL = req.params.shortURL;
  // const longURL = urlDatabase[req.params.shortURL];
  // const userID = users[req.cookies["user_id"]];
  //const templateVars = { shortURL };
  //const templateVars = { shortURL: { id: shortURL, longURL, userID}};
  console.log(users[req.cookies["user_id"]]);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]]};
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.sendStatus(404);
  }
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.render('urls_error');
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  // const shortURL = req.params.shortURL;
  // shortURL.longURL = urlDatabase[req.params.shortURL];
  // shortURL.user = users[req.cookies["user_id"]];
  // const templateVars = { shortURL };
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render('register', templateVars);
});

// const shortURL = req.params.shortURL;
// shortURL.longURL = urlDatabase[req.params.shortURL];
// shortURL.user = users[req.cookies["user_id"]];
// const templateVars = { shortURL };

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render('login', templateVars);
});

app.get('/urls.json',  (req, res) => {
  res.json(urlDatabase);
});

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

// === event listener in the end === //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});