var fs          = require('fs'),
    https       = require('https'),
    path        = require('path'),
    express     = require('express'),
    compression = require('compression'),
    serveStatic = require('serve-static'),
    cookieParser = require('cookie-parser');

var OAuth2 = require('oauth').OAuth2;

var CLIENT_ID     = process.env.CLIENT_ID,
    CLIENT_SECRET = process.env.CLIENT_SECRET,
    CALLBACK_URI  = process.env.CALLBACK_URI;

console.log({
  CLIENT_ID:     CLIENT_ID,
  CLIENT_SECRET: CLIENT_SECRET,
  CALLBACK_URI:  CALLBACK_URI
});
var oauth = new OAuth2(CLIENT_ID, CLIENT_SECRET,
                       'https://suzuri.jp', '/oauth/authorize', '/oauth/token',
                       null);
var app = express();

app.use(compression());
app.use(serveStatic('public/'));
app.use(cookieParser());
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.set('views', './views');

app.get('/', function(req, res) {
  authorizeUrl = oauth.getAuthorizeUrl({
    redirect_uri: CALLBACK_URI,
    scope: 'read write',
    response_type: 'code'
  });
  res.render('index', { authorizeUrl: authorizeUrl });
});

app.get('/callback', function(req, res) {
  var code = req.query.code;
  oauth.getOAuthAccessToken(code, {
    grant_type: "authorization_code",
    redirect_uri: CALLBACK_URI
  }, function(e, token) {
    res.cookie('token', token, { maxAge: 900000 });
    res.redirect('/');
  });
});

var server = https.createServer({
  key: fs.readFileSync('./test/fixtures/keys/key.pem'),
  cert: fs.readFileSync('./test/fixtures/keys/cert.pem')
}, app);

server.maxConnections = process.env.MAX_CONNECTIONS || 10;
server.listen(app.get("port"), function() {
  console.log("Express server listening on port " + app.get("port"));
});
