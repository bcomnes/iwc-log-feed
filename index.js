
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var logs = require('./lib/logs');
var moment = require('moment');
var schedule = require('node-schedule');

// Our express variable
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon('public/images/favicon.png'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.locals.pretty = true;

// development only
if ('development' == app.get('env')) {
  var replify = require('replify');
  app.use(express.errorHandler());

  // Use repl-client to connect to interactive repl
  //  rc /tmp/repl/iwclog.sock
  replify('iwclog', app);
}

// Routes
app.get('/', routes.index);
app.get('/atom.xml', routes.atom);
app.get('/htmltest', routes.htmltest);

// Start the server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// This is the URL to look for logs on
var baseURL = 'http://indiewebcamp.com/irc/';


// Probably not the best way to do this, but it works for now
function update () {logs.update(baseURL, moment().subtract('days', 1), function (err, data) {
  if (err) {
    console.log(err);
  }
    app.locals.log = data;
  });
}

// Schedule a job!  This triggers immediately 
schedule.scheduleJob({hour: 0, minute: 30, dayOfWeek: new schedule.Range(0, 6)}, update());

