/**
 * EDISS@./server.js
 * @author egupta
 * @description File to run the primary server.
 */


/**
 * Loading dependencies for the application
 */
var path = require('path');
var express = require('express');
var logger = require('winston');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var app= express();



/**
 * Running port for the application 
 */
var port = 8081;

/**
 * Loading mysql db connection configurations
 * @param mysql
 */
var connection = require('./config/dbConnection')(mysql);


/**
 * Loading the logger configurations
 * @param logger
 */
require('./config/logConnection')(logger);


//Serve static files
//app.set('view options', {layout:false});
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/public');
//app.use(express.static(path.join(__dirname,'public')));
/** con
 * Setting the web contain viewer to EJS
 */
//app.set('view engine', 'ejs');

/**
 * Setting Routes for all the rest request to the page
 * @param app, connection, logger
 */
require('./app/routes')(app,connection,logger,bodyParser,session);


/**
 * Runs the server on specified port
 * @param port
 */
app.listen(port);
logger.info('Server up and running on port ' + port + '!' );
