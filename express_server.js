const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

// === database === //
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// === reusable functions === //
const generateRandomString = () => {
  return Math.random().toString(36).substr(2,6);
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
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie("username", req.body.username);
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
  const templateVars = {  urls: urlDatabase, username: req.cookies['username']};
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    //const errorCode = 404;
    //res.sendStatus(404);
    res.render('urls_error');
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