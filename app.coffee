http = require 'http'

express     = require 'express'
compression = require 'compression'
serveStatic = require 'serve-static'

{OAuth2} = require 'oauth'

app = express()

app.set 'port', process.env.PORT or 3000
app.set 'view engine', 'jade'
app.set 'views', './views'

oauth = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://suzuri.jp',
  '/oauth/authorize',
  '/oauth/token',
  null)

app.get '/', (req, res) ->
  res.render 'index'


server = http.createServer(app)
server.maxConnections = (process.env.MAX_CONNECTIONS or 10)
server.listen app.get("port"), ->
  console.log "Express server listening on port " + app.get("port")
