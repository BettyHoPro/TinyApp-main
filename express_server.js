const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
// === database === //
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  }
};

// === reusable functions === //
const generateRandomString = () => {
  return Math.random().toString(36).substr(2,6);
};

const checkIfEmailExist = (email) => {
  return Object.keys(users).map(x => users[x].email).includes(email);
};

// === post === //
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  //const templateVars = { shortURL: req.params.shortURL, longURL: req.body.longURL };
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  for (let keyAsID in users) {
    if (users[keyAsID].email === req.body.email) {
      if (users[keyAsID].password === req.body.password) {
        res.cookie("user_id", users[keyAsID].id);
        res.redirect('/urls');
      }
      if (users[keyAsID].password !== req.body.password) {
        res.send('Wrong password!');
      }
    }
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  //let checkIfEmailExist = Object.keys(users).map(x => users[x].email).includes(req.body.email);
  if (req.body.email.length < 1 || req.body.password.length < 1 || checkIfEmailExist(req.body.email)) {
    res.sendStatus(400);
  }
  const userID = `user${generateRandomString(6)}RandomID`;
  users[userID] = {id: userID, email: req.body.email, password: req.body.password };
  console.log(users);
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
  const templateVars = {  urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
 
  //res.render("urls_new");
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]]};
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    //const errorCode = 404;
    res.sendStatus(404);
    // res.render('urls_error');
  }
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.render('urls_error');
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render('register', templateVars);
});

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