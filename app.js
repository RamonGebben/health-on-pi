var request = require('request');
var express = require('express');
var mustacheExpress = require('mustache-express');
var app = express();
var passport = require('passport');
var NuweStrategy = require('passport-nuwe').Strategy;
var util = require('util');

var Nuwe_CLIENT_ID = "<------NUWE_CLIENT_ID---------->"
var Nuwe_CLIENT_SECRET = "<------NUWE_CLIENT_SECRET---------->";

passport.use(new NuweStrategy({
    clientID: Nuwe_CLIENT_ID,
    clientSecret: Nuwe_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/nuwe/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's nuwe profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the nuwe account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new NuweStrategy({
    clientID: Nuwe_CLIENT_ID,
    clientSecret: Nuwe_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/nuwe/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ NuweId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

app.engine('mustache', mustacheExpress());
app.set('views', __dirname + '/views');
app.set('view engine', 'mustache');
app.use(express.static(__dirname + '/public'));
// app.use(express.logger());
// app.use(express.cookieParser());
// app.use(express.bodyParser());
// app.use(express.methodOverride());
// app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
// app.use(app.router);
app.use(express.static(__dirname + '/public'));



// app.get('/', function( req, res ){
//   res.render('dashboard');
// });

app.get('/setup', function( req, res ){
	res.render('setup');
});

app.get('/sign_up', function( req, res ){
	res.render('sign_up');
});


app.get('pizza', function( req, res ){
	request( { "url": "https://api.nuapi.co/v3/nu/scores.json", "headers": { "Content-Type": "application/json", "Authorization": "NuweToken" }},  function( err, resp, body ){
	  // code here
	});
});

///////

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/auth/nuwe',
  passport.authenticate('nuwe'),
  function(req, res){
    // The request will be redirected to nuwe for authentication, so this
    // function will not be called.
  });

app.get('/auth/nuwe/callback', 
  passport.authenticate('nuwe', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Hopi running at http://%s:%s', host, port);

});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}