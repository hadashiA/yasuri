fs    = require 'fs'
https = require 'https'
path  = require 'path'

express     = require 'express'
compression = require 'compression'
serveStatic = require 'serve-static'

{OAuth2} = require 'oauth'

app = express()

app.set 'port', process.env.PORT or 3000
app.set 'view engine', 'jade'
app.set 'views', './views'

{CLIENT_ID, CLIENT_SECRET, REDIRECT_URI} = process.env
oauth = new OAuth2(CLIENT_ID, CLIENT_SECRET,
  'https://suzuri.jp',
  '/oauth/authorize',
  '/oauth/token',
  null)

console.log {CLIENT_ID, CLIENT_SECRET}

app.get '/', (req, res) ->
  authorizeUrl = oauth.getAuthorizeUrl
    redirect_uri:  REDIRECT_URI
    scope:         'read write'
    response_type: 'code'
    
  res.render 'index', authorizeUrl: authorizeUrl

app.get '/callback', (req, res) ->
  code = req.query.code
  oauth.getOAuthAccessToken code,
    grant_type:   "authorization_code"
    redirect_uri: REDIRECT_URI
  (e, token) ->
    console.log arguments

options =
  key: fs.readFileSync('./test/fixtures/keys/key.pem'),
  cert: fs.readFileSync('./test/fixtures/keys/cert.pem')

server = https.createServer(options, app)
server.maxConnections = (process.env.MAX_CONNECTIONS or 10)
server.listen app.get("port"), ->
  console.log "Express server listening on port " + app.get("port")
